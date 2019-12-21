import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { CalendarDataLoader } from "./calendarDataLoader.js";
import { IcsParser } from "./icsParser.js";
import { EventTranslator } from "./eventTranslator.js";
import { MESSAGE_KEY_UPDATE, 
         MESSAGE_KEY_ERROR, 
         MESSAGE_KEY_EVENTS_LOADED, 
         MESSAGE_KEY_EVENT,
         MESSAGE_KEY_UPDATE_STARTED, 
         MESSAGE_KEY_UPDATE_FINISHED } from "../common/globals.js";

// Message socket opens
messaging.peerSocket.onopen = () => {
    console.log("Companion Socket Open");
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
    console.log(JSON.stringify(evt.data));
    if (evt.data.key === MESSAGE_KEY_UPDATE) {
        sendMessage({key: MESSAGE_KEY_UPDATE_STARTED});
        loadEvents().then(function (events) {
            sendMessage({ key: MESSAGE_KEY_EVENTS_LOADED });
            events.forEach(event => {
                let data = {
                    key: MESSAGE_KEY_EVENT,
                    message: event
                };
                sendMessage(data);
            });
            sendMessage({ key: MESSAGE_KEY_UPDATE_FINISHED });
        });
    }
}

// A user changes settings
settingsStorage.onchange = evt => {
    sendMessage({ key: MESSAGE_KEY_UPDATE_STARTED });
    loadEvents().then(function (events) {
        sendMessage({ key: MESSAGE_KEY_EVENTS_LOADED });
        events.forEach(event => {
            let data = {
                key: MESSAGE_KEY_EVENT,
                message: event
            };
            sendMessage(data);
        });
        sendMessage({ key: MESSAGE_KEY_UPDATE_FINISHED });
    });
};

// Send data to device using Messaging API
function sendMessage(msg) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(msg);
    }
}

function loadEvents() {
    return new Promise(function (resolve) {
        let parser = new IcsParser();
        let loader = new CalendarDataLoader();
        let translator = new EventTranslator();

        loader.loadCalendars().then(function (calendars) {
            if (loader.errors.length > 0) {
                let errorData = {
                    key: MESSAGE_KEY_ERROR,
                    message: loader.errors
                };
                sendMessage(errorData);
            } else {
                let combinedEvents = [];
                calendars.forEach(cal => {
                    let records = parser.parseICS(cal.data);
                    let timezones = parser.getTimezones(records);
                    let events = parser.getEvents(records, 5);
                    translator.translate(events, timezones, cal, combinedEvents);
                });
                resolve(combinedEvents);
            }
        });
    });
}