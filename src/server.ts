import express, { Request } from 'express';
import { launch, Page } from 'puppeteer';
import OneRoof from './oneroof';

const app = express();
const browserPromise = launch({
    headless: true,
    args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",        
    ]
});

async function withPage<T>(f: (arg0: Page) => Promise<T>) {
    const browser = await browserPromise;
    const page = await browser.newPage();
    try {
        return await f(page);
    } finally {
        page.close();
    }
}

interface AddrReq extends Request {
    params: { addr: string }
}

app.get('/ok', (_, res) => {
    res.status(200).send();
});

app.get('/oneroof/:addr', async (req: AddrReq, res) => {

    const prices = await withPage(async page => {
        const or = new OneRoof(page);
        const href = await or.findAddress(req.params.addr);
        return await or.getPrices(href);
    });  

    res.status(200).send(prices);
});


app.listen(3000);
