import document from "document";
import fs from "fs";
import * as messaging from "messaging";
import { gettext } from "i18n";
import { LAST_UPDATE_FILE } from "../common/globals.js";
import { stringify } from "querystring";

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
                } else if (info.type === "event-item-pool") {
                    configureEventTile(tile, info);
                    tile.onclick = function () {
                        let overlay = document.getElementById("detail-overlay")
                        loadOverlay(overlay, tile);
                        overlay.style.display = "inline";
                    };
                } else if (info.type === "list-footer-pool") {
                    if (fs.existsSync(LAST_UPDATE_FILE)) {
                        let lastUpdate = parseInt(fs.readFileSync(LAST_UPDATE_FILE, "ascii"));
                        let duration = formatDuration(new Date(lastUpdate), new Date());
                        let message = gettext("lastUpdate");
                        message = message.replace("{duration}", duration);
                        tile.getElementById("last-update-text").text = message;
                    }
                    // tile.onclick = function () {
                    //     if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                    //         messaging.peerSocket.send({ key: MESSAGE_KEY_UPDATE });
                    //     }
                    // }
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
        tile.getElementById("event-time-text").text = formatTime(new Date(event.event.start));
        tile.getElementById("event-duration-text").text = formatDuration(event.event.start, event.event.end);
    } else {
        tile.getElementById("event-time-text").height = 0;
        tile.getElementById("event-duration-text").height = 0;
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
    tile.getElementById("background-rect").height += tile.getElementById("event-location-text").height - 2;
    tileHeight += tile.getElementById("event-location-text").height;

    tile.getElementById("calendar-identifier").style.fill = event.event.color;

    tile.getElementById("footer-line").y1 = tileHeight;
    tile.getElementById("footer-line").y2 = tileHeight;

    tile.getElementById("fotter-black").y = tileHeight - tile.getElementById("fotter-black").height;
    tileHeight += tile.getElementById("fotter-black").height;
    tile.height = tileHeight + 2;
}

function loadOverlay(overlay, tile) {
    overlay.getElementById("detail-overlay-summary-text").text = tile.getElementById("event-summary-text").text;
    overlay.getElementById("detail-overlay-summary-text").style.fill = tile.getElementById("calendar-identifier").style.fill;
    overlay.getElementById("detail-overlay-location-text").text = tile.getElementById("event-location-text").text;
    overlay.getElementById("detail-overlay-time-text").text = tile.getElementById("event-time-text").text;
}

function toTwoDigit(num) { return ("0" + num).slice(-2); }

function formatTime(date) {
    return toTwoDigit(date.getHours()) + ":" + toTwoDigit(date.getMinutes());
}

function formatDuration(begin, end) {
    let duration = end - begin;
    duration = Math.round(duration / 1000 / 60);
    if (duration > 90) {
        duration = duration / 60;
        return duration + "h";
    } else {
        return duration + " min";
    }
}