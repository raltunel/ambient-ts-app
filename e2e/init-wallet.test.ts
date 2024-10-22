import { test, expect, BrowserContext } from 'playwright/test';
console.log('init wallet test file');

import {
    click,
    checkAndClick,
    initWallet,
    fill,
    clickmmask,
    checkAndClickMMask,
    fillmmask,
    prepareBrowser,
    waiter,
    checkForWalletConnection,
} from './helpers/utils';



let browser: BrowserContext;

test.beforeEach(async () => {
    if (browser) {
        return browser;
    }
    browser = await prepareBrowser();
});

export async function initWalletFunc(browser: BrowserContext) {
    await initWallet(browser);
}


test('init wallet', async () => {
    await initWallet(browser);
    await waiter(5);
});