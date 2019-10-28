import { MAX_EVENT_COUNT } from "../common/globals.js";

export function EventTranslator() {
};

EventTranslator.prototype.translate = function(events, calendar, eventList) {
  const today = new Date().setHours(0,0,0,0);
  
  events.forEach(evt => {
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