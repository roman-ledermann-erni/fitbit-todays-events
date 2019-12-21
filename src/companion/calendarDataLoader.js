import { settingsStorage } from "settings";
import { IcsParser } from "./icsParser.js";
import { EventTranslator } from "./eventTranslator.js";

export class CalendarDataLoader {
    constructor() { }

    loadEvents() {
        let self = this;
        self.errors = [];
        return new Promise(function (resolve) {
            let parser = new IcsParser();
            let translator = new EventTranslator();
            let calendars = getCalendarsFromSettings();
        
            fetchCalendarData(calendars).then(function (calData) {
                let combinedEvents = [];
                calData.forEach(cal => {
                    if (cal.error == false) {
                        let records = parser.parseICS(cal.data);
                        let timezones = parser.getTimezones(records);
                        let events = parser.getEvents(records, 5);
                        translator.translate(events, timezones, cal, combinedEvents);
                    } else {
                        self.errors.push(cal.name);
                    }
                });
                resolve(combinedEvents);
            });
        });
    }
};

CalendarDataLoader.prototype.errors = [];

/* Private methods */
function fetchCalendarData(calendars) {
    return new Promise(function (resolve) {
        let promises = [];
        let calData = [];
        calendars.forEach(cal => {
            let pr = fetch(cal.url).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    return { name: cal.name, url: cal.url, color: cal.color, data: text, error: false };
                }).catch(function (error) {
                    return { name: cal.name, url: cal.url, color: cal.color, data: "", error: true };
                });
            promises.push(pr);
        });
        Promise.all(promises).then(function (values) {
            values.forEach(content => calData.push(content));
            resolve(calData);
        });
    });
}

function getCalendarsFromSettings() {
    let calendars = [];
    let calNames = JSON.parse(settingsStorage.getItem("calendarList"));
    for (let counter = 0; counter < calNames.length; counter++) {
        let calUrl = settingsStorage.getItem("calUrl" + calNames[counter].name);
        let calColor = settingsStorage.getItem("calColor" + calNames[counter].name)
        if (calUrl != null && calColor != null) {
            let cal = { 
                name: calNames[counter].name,
                url: calUrl !== null ? JSON.parse(calUrl).name : null,
                color: JSON.parse(calColor)
            };
            calendars.push(cal);
        }
    }
    return calendars;
};