import assert from 'assert';
import { Page } from 'puppeteer';

import boom from '@hapi/boom';


export default class OneRoof {

    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async findAddress(addr: string) {
        await this.page.goto('https://oneroof.co.nz');

        const input = await this.page.waitForSelector('.home-search-input input');   
        assert(input != null, 'home search input not found');
        await input.click();
        await input.type(addr, { delay: 50 });

        await this.page.waitForSelector('.home-search-popup a');
        const links = await this.page.$$('.home-search-popup a');
        if (links.length === 0) {
            throw boom.notFound('no entries');
        }

        for (const link of links) {
            const href: string = await link.evaluate(l => l.href);
            // Look for an href that contains the first few words of our search
            const words = addr.split(' ').slice(0, 4);
            if (words.every(w => href.includes(w.toLowerCase().replaceAll(/[^\w]+/g, '')))) {
                return href;
            }
        }

        throw boom.notFound('no matching entries');
    }
    
    async getPrices(href: string) {
        await this.page.goto(href);

        const parsePrice = async (selector: string) => {
            const el = await this.page.waitForSelector(selector);
            assert(el != null, `${selector} not found`);
            const text = await el.evaluate(e => e.innerText);
            return parseInt(text.replaceAll(/[,$]/g, ''));
        }

        const rv = await parsePrice('.rv .price');
        const estimate = await parsePrice('.estimate .price');
        const low = await parsePrice('.low .price');
        const high = await parsePrice('.high .price');

        return { rv, estimate, low, high };
    }

}    

