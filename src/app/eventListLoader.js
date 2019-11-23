import document from "document";
import { gettext } from "i18n";

export function EventListLoader() {
  let self = this;
  this.tileList = [];
  
  self.eventList = document.getElementById("event-list");
  self.eventList.delegate = {
    getTileInfo: function(index) {
      let event = self.tileList[index];
      event.index = index;
      return event;
    },
  
    configureTile: function(tile, info) {
      if (info.type === "date-header-pool") {
        let dateStr = gettext("weekday" + info.data.getDay()) + ", " + info.data.getDate() + " " + gettext("month" + info.data.getMonth());
        tile.getElementById("date-header-text").text = dateStr;
      } else if (info.type === "event-item-pool") {
        configureEventTile(tile, info);
      }
    }
  };
};

EventListLoader.prototype.events = [];

EventListLoader.prototype.addEvent = function(event) {
  this.events.push(event);
};

EventListLoader.prototype.updateList = function() {
  this.eventList.length = this.tileList.length;
  this.eventList.redraw();
};

EventListLoader.prototype.createTileList = function() {
  let self = this;
  let now = new Date();
  
  for (let counter = 0; counter <= 5; ++counter) {
    let headerDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter);
    let headerDayAdded = false;
    self.events.forEach(event => {
      let startDay = new Date(event.start);
      startDay = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
      let endDay = new Date(event.end);
      endDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
      if (headerDay.getTime() === startDay.getTime() || headerDay.getTime() === endDay.getTime()) {
        if (headerDayAdded == false) {
          self.tileList.push({
            type: "date-header-pool",
            data: headerDay
          });
          headerDayAdded = true;
        }
        self.tileList.push({ type: "event-item-pool", event: event, });
      }
    });
  }
};

/* Private methods */
function configureEventTile(tile, event) {
  let tileHeight = tile.getElementById("header-line").y1;
  if (event.event.allDay === false) {
    tile.getElementById("event-time-text").text = formatTime(new Date(event.event.start)) + " - " + formatTime(new Date(event.event.end));
  } else {
    tile.getElementById("event-time-text").height = 0;
  }
  tile.getElementById("background-rect").height = tile.getElementById("event-time-text").height
  tileHeight += tile.getElementById("event-time-text").height;
  
  let summary = tile.getElementById("event-summary-text");
  summary.text = event.event.summary;
  tile.getElementById("event-summary-row-placeholder").style.display = "none";
  tile.getElementById("background-rect").height += tile.getElementById("event-summary-row-placeholder").height;
  tileHeight += tile.getElementById("event-summary-row-placeholder").height;
  if (summary.textOverflowing) {
    summary.height = tile.getElementById("event-summary-row-placeholder").height * 2;
    tile.getElementById("event-summary-row-placeholder").style.display = "inline";
    tile.getElementById("background-rect").height += tile.getElementById("event-summary-row-placeholder").height;
    tileHeight += tile.getElementById("event-summary-row-placeholder").height;
  }
        
  tile.getElementById("event-location-text").text = event.event.location;
  tile.getElementById("background-rect").height += tile.getElementById("event-location-text").height - 1;
  tileHeight += tile.getElementById("event-location-text").height;
  
  tile.getElementById("footer-line").y1 = tileHeight;
  tile.getElementById("footer-line").y2 = tileHeight;
  
  tile.getElementById("fotter-black").y = tileHeight - tile.getElementById("fotter-black").height;
  tileHeight += tile.getElementById("fotter-black").height;
  tile.height = tileHeight + 2;
}

function toTwoDigit(num) { return ("0" + num).slice(-2); }

function formatTime(date) {
  return toTwoDigit(date.getHours()) + ":" + toTwoDigit(date.getMinutes());
}