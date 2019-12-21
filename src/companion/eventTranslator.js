
export class EventTranslator {
    constructor() { }

    translate(events, timezones, calendar, eventList) {
        events.forEach(evt => {
            fixDates(evt, timezones);
            var translatedEvt = {
                start: evt.start.getTime(),
                end: evt.end === undefined ? evt.start.getTime() : evt.end.getTime(),
                allDay: evt.allDay !== undefined ? evt.allDay : false,
                summary: evt.summary,
                location: evt.location === undefined ? "" : evt.location,
                cal: calendar.name,
                color: calendar.color,
            };
            eventList.push(translatedEvt);
        });
    }
};

/* Private methods */
function fixDates(evt, timezones) {
    let tzStart = timezones[evt.tzidstart];
    let tzEnd = timezones[evt.tzidend];

    if (tzStart) {
        let offset = parseInt(tzStart["DAYLIGHT"].tzoffsetto) / 100;
        if (isDaylightSavings(evt.start) == false) {
            offset = parseInt(tzStart["STANDARD"].tzoffsetto) / 100;
        }
        evt.start = createDateAsUTC(evt.start, offset);
    }

    if (tzEnd) {
        let offset = parseInt(tzEnd["DAYLIGHT"].tzoffsetto) / 100;
        if (isDaylightSavings(evt.end) == false) {
            offset = parseInt(tzEnd["STANDARD"].tzoffsetto) / 100;
        }
        evt.end = createDateAsUTC(evt.end, offset);
    }
}

function createDateAsUTC(date, offset) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - offset, date.getMinutes(), date.getSeconds()));
}

function isDaylightSavings(date) {
    let jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) != date.getTimezoneOffset();
}