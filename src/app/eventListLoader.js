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
        let dateStr = info.data.getDay() + ", " + info.data.getDate() + " " + info.data.getMonth();
        tile.getElementById("date-header-text").text = dateStr;
      } else if (info.type === "event-item-pool") {
        console.log(info.event.summary);
        let summary = tile.getElementById("event-summary");
        summary.text = info.event.summary;
        if (summary.textOverflowing || !info.event.location) {
          summary.height = 68;
          tile.getElementById("event-summary-row-placeholder").style.display = "inline";
        }
        
        tile.getElementById("event-location").text = new Date(info.event.start) + ", " + info.event.location;
      }
    }
  };
};

EventListLoader.prototype.events = [];

EventListLoader.prototype.addEvent = function(event) {
  this.events.push(event);
}

EventListLoader.prototype.updateList = function() {
  this.eventList.length = this.events.length;
  this.eventList.redraw();
}

EventListLoader.prototype.createTileList = function() {
  let self = this;
  let now = new Date();
  let headerDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  headerDay.setDate(headerDay.getDate() -1);
  
  self.events.forEach(event => {
    let eventDate = new Date(event.start);
    if (headerDay < eventDate) {
      headerDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      self.tileList.push({
        type: "date-header-pool",
        data: headerDay
      });
      headerDay.setDate(headerDay.getDate() + 1);
    }
    
    self.tileList.push({
      type: "event-item-pool",
      event: event,
    });
  });
}

/* Private methods */
