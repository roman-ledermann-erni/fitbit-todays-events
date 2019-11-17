import document from "document";
import * as messaging from "messaging";
import { EventListLoader } from "./eventListLoader.js";
import { MESSAGE_KEY_ERROR, MESSAGE_KEY_CLEAR_EVENTS, MESSAGE_KEY_EVENTS, MESSAGE_KEY_UPDATE_FINISHED } from "../common/globals.js";

let background = document.getElementById("background");
let listLoader = new EventListLoader();

// Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt)}`);
  if (evt.data.key === MESSAGE_KEY_EVENTS) {
    listLoader.addEvent(evt.data.message);
  }
  if (evt.data.key === MESSAGE_KEY_UPDATE_FINISHED) {
    listLoader.createTileList();
    listLoader.updateList();
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
