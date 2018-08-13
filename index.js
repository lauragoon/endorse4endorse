const puppeteer = require('puppeteer');

async function run() { 
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://linkedin.com");

    // Login the User, will replace the login information with terminal input soon
    await page.waitForSelector("#login-email");
    await page.click("#login-email");
    await page.type("#login-email", "", {delay:25});
    await page.click("#login-password");
    await page.type("#login-password", "", {delay:25});
    await page.click("#login-submit");
    await page.waitFor(5000);

    // Navigates to the Connections page
    await page.evaluate(function() { $("div.content-container span:contains('Connections')").click(); });
    await page.waitFor(5000);

    // Computes the number of connections, to be used later
    const count = await page.evaluate(function() { return document.querySelector('.mn-connections-summary__count').innerText; });    
    const connectionCount = await parseInt(count, 10);
    await page.evaluate(function() { $("a:contains('See all')").click(); });
    await page.waitFor(3000);    
    
    // Scrolls down the webpage, in order to look at all the connections. The acceptable range
    // of error is 3 (ie, it is possible for this to miss out on 3 connections)
    await page.evaluate(async function scroll(size) {

        // Sleep function pulled from StackOverflow
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        var count = 0;
        while (count < size - 3) {
            var list = document.querySelectorAll('a.mn-connection-card__picture');
            count = list.length;
            list[count - 1].scrollIntoView();
            await sleep(5000);
        }
    }, connectionCount);
    
    await page.waitFor(1000);
    
    // Extracts all the urls from the page
    const list = await page.evaluate(async function temp() {
        var endList = [];
        var list = await document.querySelectorAll('a.mn-connection-card__picture');
        for (var i = 0; i < list.length; i += 1) {
            var url = await list[i].href;
            await endList.push(url);
        }
        return endList;
    });

    console.log(list);

    

    await page.waitFor(10000);

    await browser.close();
    
}

run();
