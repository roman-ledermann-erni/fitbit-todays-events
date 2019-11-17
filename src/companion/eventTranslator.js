import { MAX_EVENT_COUNT } from "../common/globals.js";

export function EventTranslator() {
};

EventTranslator.prototype.translate = function(events, timezones, calendar, eventList) {
  const today = new Date().setHours(0,0,0,0);
  
  events.forEach(evt => {
    fixDates(evt, timezones);
    if (evt.end >= today) {
      var translatedEvt = {
        start: evt.start.getTime(),
        end:  evt.end === undefined ? evt.start.getTime() : evt.end.getTime(),
        allDay: evt.allDay !== undefined ? evt.allDay : false,
        summary: evt.summary,
        location: evt.location === undefined ? "" : evt.location,
        cal: calendar.name,
        color: calendar.color,
      };
      eventList.push(translatedEvt);
    }
  });
};

EventTranslator.prototype.limit = function(events) {
  events.sort(function (a, b) { return a.start - b.start; });
  events = events.slice(0, MAX_EVENT_COUNT);
  return events;
};

function fixDates(evt, timezones) {
  let tzStart = timezones[evt.tzidstart];
  let tzEnd = timezones[evt.tzidend];
  let today = new Date();
  
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