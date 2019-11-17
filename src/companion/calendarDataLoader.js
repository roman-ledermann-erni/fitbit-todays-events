import { settingsStorage } from "settings";

export function CalendarDataLoader() {
};

CalendarDataLoader.prototype.errors = [];

CalendarDataLoader.prototype.loadCalendars = function() {
  let self = this;
  self.errors = [];
  
  return new Promise(function(resolve) {
    let calendars = getCalendarsFromSettings();
    let promises = [];
    let calData = [];
    
    calendars.forEach(cal => {
      let pr = fetch(cal.url).then(function(response) {
        return response.text();
      }).then(function(text) {
        return { name: cal.name, url: cal.url, color: cal.color, data: text };
      }).catch(function(error) {
        return {"error": cal.name};
      });
      promises.push(pr);
    });
    
    Promise.all(promises).then(function(values) {
      values.forEach(content => {
        if (content.error !== undefined) {
          self.errors.push(content.error);
        } else {
          calData.push(content);
        }
      });
      resolve(calData);
    });
  });
};

/* Private methods */
function getCalendarsFromSettings() {
  let calendars = [];
  let counter = 0;
    
  let calName = null;
  let calUrl = null;
  let calColor = null;
  do {
	  calName = JSON.parse(settingsStorage.getItem(`cal${counter}Name`));
    calUrl = JSON.parse(settingsStorage.getItem(`cal${counter}Url`));
    calColor = JSON.parse(settingsStorage.getItem(`cal${counter}Color`));
    
    if (counter < 5 && calUrl !== undefined && calUrl !== null) {
      var cal = { name: calName.name, url: calUrl.name, color: calColor };
      calendars.push(cal);
    }
    counter++;
  } while (counter < 5 && calUrl !== undefined && calUrl !== null);
  return calendars;
};