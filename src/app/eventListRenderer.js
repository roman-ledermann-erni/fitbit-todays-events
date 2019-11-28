import document from "document";
import { gettext } from "i18n";

export class EventListRenderer {
    constructor() {
        this.eventList = [];
    }

    renderList(events) {
        let self = this;
        this.eventList = events;
        let tileList = document.getElementById("event-list");
        tileList.delegate = {
            getTileInfo: function (index) {
                let event = self.eventList[index];
                event.index = index;
                return event;
            },
            configureTile: function (tile, info) {
                if (info.type === "date-header-pool") {
                    let headerDate = new Date(info.date);
                    let dateStr = gettext("weekday" + headerDate.getDay()) + ", " + headerDate.getDate() + " " + gettext("month" + headerDate.getMonth());
                    tile.getElementById("date-header-text").text = dateStr;
                }
                else if (info.type === "event-item-pool") {
                    configureEventTile(tile, info);
                }
            }
        };
        tileList.length = this.eventList.length;
        tileList.redraw();
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