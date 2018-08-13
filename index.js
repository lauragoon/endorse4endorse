const puppeteer = require('puppeteer');
const prompt = require('prompt');

async function run(email, password) { 
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://linkedin.com");

    // Login the User, will replace the login information with terminal input soon
    await page.waitForSelector("#login-email");
    await page.click("#login-email");
    await page.type("#login-email", email, {delay:25});
    await page.click("#login-password");
    await page.type("#login-password", password, {delay:25});
    await page.click("#login-submit");
    await page.waitFor(5000);

    // Navigates to the Connections page
    await page.evaluate(function temp() { 
        $("div.content-container span:contains('Connections')").click(); 
    });
    await page.waitFor(5000);

    // Computes the number of connections, to be used later
    const count = await page.evaluate(function temp() { 
        return document.querySelector('.mn-connections-summary__count').innerText; 
    });    
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

    // endorses the top three skills on a person's profile
    // Requirments: URL must be the person's profile link
    //              Current User must be signed into LinkedIn
    //              User and Linked-person must be connected
    async function endorse(URL, page) {
        await page.goto(URL);
        await page.waitFor(3000);
        await page.evaluate(function temp() { 
            document.querySelector('.pv-deferred-area--pending').scrollIntoView(); 
        });
        await page.waitFor(2000);
        await page.evaluate(async function temp() {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            var endorseButtons = document.querySelectorAll('.pv-skill-categories-section__top-skills li-icon');
            for (var i = 0; i < endorseButtons.length; i += 1) {
                var button = endorseButtons[i];
                if (button.getAttribute("type") == "plus-icon") {
                    button.click();
                    await sleep(1000);
                }
            }
        });
    }
    
    // endorses all the people in the extracted list
    for (var i = 0; i < list.length; i += 1) {
        url = list[i];
        await endorse(url, page);
        await page.waitFor(1000); // 1 second time between each person
    }

    await page.waitFor(10000);

    await browser.close();
    
}

prompt.start();

// prompt the user to enter their login details for linkedin
prompt.get(['email', 'password'], function (err, result) { 
    run(result.email, result.password);
});
