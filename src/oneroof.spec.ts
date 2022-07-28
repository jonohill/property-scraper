import { expect } from 'chai';
import puppeteer, { Browser, Page } from 'puppeteer';

import OneRoof from "./oneroof";


describe('oneroof', function () {

    this.timeout(20000);

    let browser: Browser;
    let page: Page;

    this.beforeAll(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
    });

    this.afterAll(async () => {
        await page.close();
        await browser.close();
    })

    it('finds an address', async () => {

        const or = new OneRoof(page);
        const url = await or.findAddress('9 Arney Road, Remuera');
        
        expect(url).contains('arney');
    }); 

    it('gets prices', async () => {
        const or = new OneRoof(page);
        const estimate = await or.getPrices('https://www.oneroof.co.nz/estimate/7-domain-road-glenfield-north-shore-city-auckland-1174546');

        expect(estimate.rv).is.a('number').greaterThan(1000000);
        expect(estimate.estimate).is.a('number').greaterThan(1000000);
        expect(estimate.low).is.a('number').greaterThan(1000000);
        expect(estimate.high).is.a('number').greaterThan(1000000);
    });

});
