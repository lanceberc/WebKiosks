const scrollConfigFile = "./Scroll.json";
let scrollurl = "https://theclubspot.com/regatta/X9r0dNPDq1/results?list_view=true";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function continueResize(e) {
    console.debug("Scroll: Loading bottomFrame");
    const bottomFrame = document.getElementById("bottomFrame");
    bottomFrame.src = scrollurl;
}

async function checkResize() {
    const outer = document.getElementById("outer");
    const inner = document.getElementById("inner");
    const topFrame = document.getElementById("topFrame");
    topFrame.addEventListener("load", continueResize);
    topFrame.src = scrollurl;
    console.debug("Scroll: Waiting for topFrame to load");
}

async function getHeightFromConfig() {
    let height = false;
    await fetch(scrollConfigFile)
	.then(response => response.json())
	.then(data => {
	    height = data[scrollurl];
	    if (height) {
		console.debug(`Scroll: Setting height to: ${height}`);
		document.documentElement.style.setProperty('--scroll-height', height + 'px');
		const scrollTime = `${height / 30}`;
		console.debug(`Scroll: Setting scroll period to ${scrollTime} seconds`);
		document.documentElement.style.setProperty('--scroll-time', scrollTime + 's');
	    } else {
		console.debug(`Scroll: URL not found: ${scrollurl}`);
	    }
	})
	.catch(e => {
	    console.error(`Scroll: Couldn't fetch: ${scrollConfigFile}: ${e}`);
	});
    return(height);
 }

async function initialize() {
    const qs = window.location.search.substring(1); // Remove leading ?
    if (qs != "") scrollurl = qs;

    let h = await getHeightFromConfig();
    if (!h) {
	console.log(`Scroll: requesting height for ${scrollurl}`);
	await fetch(`Kiosks/wsgi/scrollprep.html?${scrollurl}`)
	    .then(response => response.json())
	    .then(data => {
	    })
	    .catch(e => {
		console.debug(`Scroll: prep failed: ${e}`);
	    });
	h = await getHeightFromConfig();
	if (!h) console.log(`Scroll: Couldn't detect height`);
    }
    
    window.addEventListener('resize', checkResize);
    checkResize();
}

window.addEventListener('DOMContentLoaded', initialize);
//window.addEventListener('load', initialize);
