/*
 * A frontend that handles simple changes to the kiosk infrastructure
 * by sending requests (as HTML gets) to the WSGI backend.
 */

// Has to match the WSGI pass through in the nginx configuration
const baseURL = "wsgi/kiosks";

let Kiosks = {};

function changeScene(ev) {
    let newScene = "";
    let newURL = "";
    
    function confirm(e) {
	const el = e.target;

	newURL = document.getElementById("newURL").value.trim();
	
	if (el.innerHTML == "OK" && newURL != "") {
	    // Need to url encode
	    const ns = encodeURIComponent(newScene);
	    const nu = encodeURIComponent(newURL);
	    const comp = encodeURIComponent(`?changeScene=${ns}&URL=${nu}`);
	    const url = `${baseURL}/${comp}`;
	    fetchKiosks(url);
	}
	dialog.close();
    }
    
    newScene = ev.target.Scene;
    console.debug(`Change scene ${newScene}`);
    
    let div;
    const dialog = document.getElementById("dialog");
    dialog.innerHTML = "";

    const dialogInner = document.createElement("div");
    dialogInner.classList.add("changeScene");
    dialog.appendChild(dialogInner);

    div = document.createElement("div");
    div.innerHTML = `${newScene}: ${Kiosks["Scenes"][newScene]}`;
    dialogInner.appendChild(div);

    div = document.createElement("div");
    div.innerHTML = "&nbsp;"
    dialogInner.appendChild(div);
    
    div = document.createElement("div");
    div.innerHTML = "Change URL to:"
    dialogInner.appendChild(div);
    
    // div = document.createElement("div");
    const input = document.createElement("input");
    input.id = "newURL";
    input.type = "text";
    input.placeholder = "<Paste URL here>";
    input.value = Kiosks["Scenes"][newScene];
    dialogInner.appendChild(input);
    //div.appendChild(input);
    //dialogInner.appendChild(div);

    div = document.createElement("div");
    div.innerHTML = "&nbsp;"
    dialogInner.appendChild(div);
    
    const confirmBar = document.createElement("div");
    confirmBar.classList.add("modalConfirm");
    dialogInner.appendChild(confirmBar);

    for (const label of ["Cancel", "OK"]) {
	div = document.createElement("button");
	div.classList.add(label);
	div.innerHTML = label;
	div.addEventListener("click", confirm);
	confirmBar.appendChild(div);
    }
    
    dialog.showModal();
}

function changeRole(ev) {
    let newScene = "";
    let newRole = "";

    function changeRoleHandler(e) {
	newScene = e.target.innerHTML;
	const div = document.getElementById("newScene");
	div.innerHTML = `Change to: ${newScene} (${Kiosks["Scenes"][newScene]})`;
    }
    
    function confirm(e) {
	const el = e.target;
	if (el.innerHTML == "OK" && newScene != "") {
	    // Need to url encode
	    const url = `${baseURL}?changeRole=${newRole}&Scene=${newScene}`;
	    fetchKiosks(url);
	}
	dialog.close();
    }

    newRole = ev.target.Role;
    console.debug(`Change role ${newRole}`);
    
    let div;
    const dialog = document.getElementById("dialog");
    dialog.innerHTML = "";
    
    const dialogInner = document.createElement("div");
    dialogInner.classList.add("changeRole");
    dialog.appendChild(dialogInner);

    div = document.createElement("div");
    div.innerHTML = `${newRole}: ${Kiosks["Roles"][newRole]}`;
    dialogInner.appendChild(div);

    div = document.createElement("div");
    div.id = "newScene";
    div.innerHTML = `Change to: ${newScene}`;
    dialogInner.appendChild(div);

    div = document.createElement("div");
    div.innerHTML = "&nbsp;"
    dialogInner.appendChild(div);

    const table = document.createElement("table");
    table.classList.add("roleTable");
    const thead = document.createElement("thead");
    table.appendChild(thead);
    for (const s in Kiosks["Scenes"]) {
	const tr = document.createElement("tr");
	let td = document.createElement("td");
	const button = document.createElement("button");
	button.innerHTML = `${s}`;
	button.addEventListener('click', changeRoleHandler);
	td.appendChild(button);
	tr.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = Kiosks["Scenes"][s];
	tr.appendChild(td);
	table.appendChild(tr);
    }
    dialogInner.appendChild(table);
    
    div = document.createElement("div");
    div.innerHTML = "&nbsp;"
    dialogInner.appendChild(div);
    
    const confirmBar = document.createElement("div");
    confirmBar.classList.add("modalConfirm");
    dialogInner.appendChild(confirmBar);

    for (const label of ["Cancel", "OK"]) {
	div = document.createElement("button");
	div.classList.add(label);
	div.innerHTML = label;
	div.addEventListener("click", confirm);
	confirmBar.appendChild(div);
    }
    
    dialog.showModal();
}

function constructPage() {
    let div;
    const scenesBody = document.getElementById('scenesBody');
    scenesBody.innerHTML = "";
    for (const s in Kiosks["Scenes"]) {
	const button = document.createElement("button");
	button.innerHTML = "Change URL";
	button.Scene = s;
	button.addEventListener("click", changeScene);
	const scene = document.createElement("td");
	scene.innerHTML = `${s}`;
	const url = document.createElement("td");
	const uri = decodeURIComponent(Kiosks["Scenes"][s]);
	if (uri != Kiosks["Scenes"][s]) {
	    console.debug(` URI: ${Kiosks["Scenes"][s]}`);
	    console.debug(`dURI: ${uri}`);
	}
	url.innerHTML = uri;
	div = document.createElement("tr");
	div.appendChild(button);
	div.appendChild(scene);
	div.appendChild(url);
	scenesBody.appendChild(div);
    }

    const rolesBody = document.getElementById('rolesBody');
    rolesBody.innerHTML = "";
    for (const r in Kiosks["Roles"]) {
	const button = document.createElement("button");
	button.innerHTML = "Change Scene";
	button.Role = r;
	button.addEventListener("click", changeRole);
	const role = document.createElement("td");
	role.innerHTML = `${r}`;
	const scene = document.createElement("td");
	scene.innerHTML = `${Kiosks["Roles"][r]}`;
	div = document.createElement("tr");
	div.appendChild(button);
	div.appendChild(role);
	div.appendChild(scene);
	rolesBody.appendChild(div);
    }
}

async function fetchKiosks(url) {
    const fetchParams = {
	method: 'GET',
	/*headers: { 'Content-Type': 'application/json'	}, */
    }
    try {
	const response = await fetch(url, fetchParams);
	if (!response.ok) {
	    throw new Error(`Response status: ${response.status}`);
	}

	Kiosks = await response.json();
	console.info(Kiosks);
	constructPage();
    } catch (error) {
	console.error(error.message);
    }
}

function updateClock() {
    const now = new Date();
    const time = now.format("HH:MM");
    const clock = document.getElementById("clock");
    clock.innerHTML = time;
}

function initialize() {
    const intervalID = setInterval(updateClock, 1000);
    fetchKiosks(baseURL);
}

//window.addEventListener('DOMContentLoaded', initialize);
window.addEventListener('load', initialize);
