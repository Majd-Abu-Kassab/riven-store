import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    console.log('Typing credentials...');
    await page.type('input[type="email"]', 'majdabokassab@yahoo.com');
    await page.type('input[type="password"]', 'Majd$7314');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation to admin...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log('Navigating to products...');
    await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle0' });
    
    console.log('Clicking Add Product...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Add Product'));
        if (addBtn) addBtn.click();
    });

    await page.waitForTimeout(1000); // UI animation

    console.log('Filling out form...');
    // Assuming the first few inputs are part of the form
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        if (inputs.length > 2) {
            inputs[1].value = 'Puppeteer Test'; // Name
            inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
            
            inputs[3].value = '10'; // Price
            inputs[3].dispatchEvent(new Event('input', { bubbles: true }));
            inputs[3].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    console.log('Clicking Create Product...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const createBtn = buttons.find(b => b.textContent && b.textContent.includes('Create Product'));
        if (createBtn) createBtn.click();
    });

    console.log('Waiting 5 seconds for any logs...');
    await page.waitForTimeout(5000);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'puppeteer_test_result.png' });

    console.log('Done.');
    await browser.close();
})();
