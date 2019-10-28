import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";
import iCalendar from "./iCalendar.js";
import { CalendarDataLoader } from "./calendarDataLoader.js";
import { IcsParser } from "./icsParser.js";
import { EventTranslator } from "./eventTranslator.js";
import { MESSAGE_KEY_ERROR, MESSAGE_KEY_EVENTS } from "../common/globals.js";

// Message socket opens
messaging.peerSocket.onopen = () => {
  sendEvents();
};

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  console.log(JSON.stringify(evt.data));
}

// A user changes settings
settingsStorage.onchange = evt => {
  sendEvents();
};

// Send data to device using Messaging API
function sendMessage(msg) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(msg);
  }
}

function sendEvents() {
  let parser = new IcsParser();
  let loader = new CalendarDataLoader();
  let translator = new EventTranslator();
  loader.loadCalendars().then(function(calendars) {
    if (loader.errors.length > 0) {
      let errorData = {
        key: MESSAGE_KEY_ERROR,
        message: loader.errors
      };
      sendMessage(errorData);
    } else {
      var combinedEvents = [];
      calendars.forEach(cal => {
        let events = parser.parseICS(cal.data);
        events = parser.unpackEvents(events);
        translator.translate(events, cal, combinedEvents);
      });
      combinedEvents = translator.limit(combinedEvents);
      combinedEvents.forEach(event => {
        let data = {
          key: MESSAGE_KEY_EVENTS,
          message: event
        };
        sendMessage(data);
      });
    }
  });
}