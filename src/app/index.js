import fs from "fs";
import document from "document";
import * as messaging from "messaging";
import { gettext } from "i18n";
import { EventListCreator } from "./eventListCreator.js";
import { EventListRenderer } from "./eventListRenderer.js";
import { MESSAGE_KEY_UPDATE, MESSAGE_KEY_ERROR, MESSAGE_KEY_EVENTS_LOADED, MESSAGE_KEY_EVENT, MESSAGE_KEY_UPDATE_STARTED, MESSAGE_KEY_UPDATE_FINISHED, EVENT_DATA_FILE } from "../common/globals.js";

// Initialization
let listCreator = new EventListCreator();
let listRenderer = new EventListRenderer();
const detailOverlay = document.getElementById("detail-overlay");

document.onkeypress = function(event) {
    if (detailOverlay.style.display == "inline") {
        if (event.key == "back") {
            detailOverlay.style.display = "none";
            event.preventDefault();
        }
    }
}

document.getElementById("header-container").onclick = () => {
    sendMessage({ key: MESSAGE_KEY_UPDATE });
}

document.getElementById("detail-back-btn").onclick = () => {
    detailOverlay.style.display = "none";
}

if (fs.existsSync(EVENT_DATA_FILE)) {
    let eventList = fs.readFileSync(EVENT_DATA_FILE, "cbor");
    if (eventList !== undefined) {
           listRenderer.renderList(eventList);
    }
}

// Message is received
messaging.peerSocket.onmessage = evt => {
    console.log(`App received: ${JSON.stringify(evt)}`);
    if (evt.data.key === MESSAGE_KEY_UPDATE_STARTED) {
        showSpinner();
    }
    if (evt.data.key === MESSAGE_KEY_EVENTS_LOADED) {
        listCreator.clearEvents();
    }
    if (evt.data.key === MESSAGE_KEY_EVENT) {
        listCreator.addEvent(evt.data.message);
    }
    if (evt.data.key === MESSAGE_KEY_UPDATE_FINISHED) {
        let eventList = listCreator.createTileList();
        listRenderer.renderList(eventList);
        hideSpinner();
        fs.writeFileSync(EVENT_DATA_FILE, eventList, "cbor");
    }
};

// Message socket opens
messaging.peerSocket.onopen = () => {
    console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
    console.log("App Socket Closed");
};

// Send data to companion using Messaging API
function sendMessage(msg) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(msg);
    }
}

function showSpinner() {
    document.getElementById("update-overlay").style.display = "inline";
    document.getElementById("update-spinner").state = "enabled";;
}

function hideSpinner() {
    document.getElementById("update-overlay").style.display = "none";
    document.getElementById("update-spinner").state = "disabled";;
}
