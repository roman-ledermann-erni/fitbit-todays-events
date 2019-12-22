import * as messaging from "messaging";
import { me as companion } from "companion";
import { settingsStorage } from "settings";
import { localStorage } from "local-storage";
import { CalendarDataLoader } from "./calendarDataLoader.js";
import * as msgTypes from "../common/messages.js";
import * as globals from "../common/globals.js";

if (companion.permissions.granted("run_background")) {
    companion.addEventListener("wakeinterval", updateIntervalExpired);
}

if (companion.launchReasons.wokenUp) {
    updateIntervalExpired();
}

// Message socket opens
messaging.peerSocket.onopen = () => {
    sendEventsToDevice();
    sendErrorsToDevice();
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
    console.log(JSON.stringify(evt.data));
    if (evt.data.key === msgTypes.MESSAGE_KEY_UPDATE) {
        if (localStorage.getItem("events") == null) {
            loadEvents().then(function () {
                if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                    sendEventsToDevice();
                    sendErrorsToDevice();
                }
            });
        } else {
            sendEventsToDevice();
            sendErrorsToDevice();
        }
    }
}

// A user changes settings
settingsStorage.onchange = evt => {
    loadEvents().then(function () {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            sendEventsToDevice();
            sendErrorsToDevice();
        }
    });
};

function updateIntervalExpired() {
    loadEvents().then(function () {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            sendEventsToDevice();
            sendErrorsToDevice();
        }
    });
}

/* Private Methods */
function loadEvents() {
    return new Promise(function (resolve) {
        let loader = new CalendarDataLoader();

        loader.loadEvents().then(function (events) {
            localStorage.setItem("events", JSON.stringify(events));
            localStorage.setItem("errors", JSON.stringify(loader.errors));
    
            let updateInterval = getUpdateInterval();
            companion.wakeInterval = updateInterval * globals.MILLISECONDS_PER_MINUTE;
            resolve();
        });
    });
}

function sendEventsToDevice() {
    let storedEvents = localStorage.getItem("events");
    if (storedEvents != null) {
        sendMessage({ key: msgTypes.MESSAGE_KEY_EVENTS_LOADED });

        let events = JSON.parse(localStorage.getItem("events"));
        events.forEach(event => {
            let data = {
                key: msgTypes.MESSAGE_KEY_EVENT,
                message: event
            };
            sendMessage(data);
        });

        localStorage.removeItem("events");
        sendMessage({ key: msgTypes.MESSAGE_KEY_UPDATE_FINISHED });
    }
}

function sendErrorsToDevice() {
    let storedErrors = localStorage.getItem("errors");
    if (storedErrors != null) {
        let errors = JSON.parse(localStorage.getItem("errors"));
        errors.forEach(err => {
            let data = {
                key: msgTypes.MESSAGE_KEY_ERROR,
                message: err
            };
            sendMessage(data);
        });
        localStorage.removeItem("errors");
    }
}

function getUpdateInterval() {
    let intervalSettings = JSON.parse(settingsStorage.getItem("updateInterval"));
    let interval = intervalSettings.values[0].value;
    return interval;
}

function sendMessage(msg) {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(msg);
    }
}