import { settingsStorage } from "settings";

export class CalendarDataLoader {
    constructor() { }

    loadCalendars() {
        let self = this;
        self.errors = [];
        return new Promise(function (resolve) {
            let calendars = getCalendarsFromSettings();
            let promises = [];
            let calData = [];
            calendars.forEach(cal => {
                let pr = fetch(cal.url).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    return { name: cal.name, url: cal.url, color: cal.color, data: text };
                }).catch(function (error) {
                    return { "error": cal.name };
                });
                promises.push(pr);
            });
            Promise.all(promises).then(function (values) {
                values.forEach(content => {
                    if (content.error !== undefined) {
                        self.errors.push(content.error);
                    }
                    else {
                        calData.push(content);
                    }
                });
                resolve(calData);
            });
        });
    }
};

CalendarDataLoader.prototype.errors = [];

/* Private methods */
function getCalendarsFromSettings() {
    let calendars = [];
    let calNames = JSON.parse(settingsStorage.getItem("calendarList"));
    for (let counter = 0; counter < calNames.length; counter++) {
        let calUrl = JSON.parse(settingsStorage.getItem("calUrl" + calNames[counter].name));
        let calColor = JSON.parse(settingsStorage.getItem("calColor" +calNames[counter].name));
        let cal = { 
            name: calNames[counter].name,
            url: calUrl.name,
            color: calColor
        };
        calendars.push(cal);
    }
    return calendars;
};