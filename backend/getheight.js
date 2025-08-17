//const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer');
const fs = require('fs');

const scrollConfigFile = "/var/www/html/Scroll.json";
let url = 'https://theclubspot.com/regatta/X9r0dNPDq1/results?list_view=true';

let maxAttempts = 10;
let macChromium = '/Users/lance/Downloads/chrome-mac\ 2/Chromium.app/Contents/MacOS/Chromium';
let rpiChromium = "/usr/bin/chromium-browser";

async function pup() {
    const browser = await puppeteer.launch({
	executablePath: rpiChromium,
        args: [
	    '--no-sandbox',
	    '--disable-setuid-sandbox',
	    '--disable-web-security',
	    '--disable-features=IsolateOrigins,site-per-process',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--blink-settings=imagesEnabled=false',
            '--enable-privacy-sandbox-ads-apis',
	],
	headless: true
    });
    
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});

    // wait keywords 'load', 'domcontentloaded', 'networkidle0', 'networkidle2'
    try {
	console.debug(`Loading ${url}`);
	await page.goto(url, {
	    timeout: 120000,
	    waitUntil: 'networkidle0'});
    } catch(e) {
	console.debug(`Navigation failed ${e}`);
	return null;
    }
    //console.debug(`Loaded ${url}`);

    let attempt = 0;
    let success = false;

    let heights;
    let height = null;
    
    while (attempt < maxAttempts && !success) {
	attempt++;
	heights = await page.$$eval('html', htmls => htmls.map(el => el.scrollHeight));
	//console.debug("Heights: " + heights);
	if (heights.length) height = heights[0];
	if (typeof height === 'number' && Number.isInteger(height)) {
	    //console.debug(`scrollHeight: ${height}`);
	    if (height > 1080 && height < 10000) {
		success = true;
	    } else {
		console.debug(`Height ${height} out of range, waiting for load`);
	    }
	} else {
	    console.debug(`height '${height}' isn't an integer`);
	    await browser.close();
	    return null;
	};

	if (!success) {
	    console.debug(`sleep 10`);
	    await sleep(10000);
	}
    }
    await browser.close();
    return height;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const args = process.argv;
    if (args.length > 1) {
	url = args[2];
    }
    
    const height = await pup(url);

    if (height) {
	let scrollConfig = {};
	fs.readFile(scrollConfigFile, "utf8", (err, readData) => {
	    if (err) {
		console.log(`Couldn't read '${scrollConfigFile}' ${err}`);
	    } else {
		scrollConfig = JSON.parse(readData);
		scrollConfig[url] = height;

		let writeData = JSON.stringify(scrollConfig, null, 4);
		fs.writeFile(scrollConfigFile, writeData, "utf8", (err) => {
		    if (err) {
			console.log(`Couldn't write '${scrollConfigFile}' ${err}`);
		    } else {
			console.log(`Updated '${scrollConfigFile}'`);
		    }
		});
	    }
	});
    }
}

main();
