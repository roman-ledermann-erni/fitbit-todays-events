import document from "document";
import fs from "fs";
import * as messaging from "messaging";
import { gettext } from "i18n";
import { LAST_UPDATE_FILE } from "../common/globals.js";
import * as elements from "../common/ui.js";
import * as msgTypes from "../common/messages.js";

export class EventListRenderer {
    constructor() {
        this.eventList = [];
    }

    renderList(events) {
        let self = this;
        this.eventList = events;
        let tileList = document.getElementById(elements.EVENT_LIST_ELEMENT);
        tileList.delegate = {
            getTileInfo: function (index) {
                let event = self.eventList[index];
                event.index = index;
                return event;
            },
            configureTile: function (tile, info) {
                if (info.type === elements.EVENT_LIST_HEADER_TYPE) {
                    let headerDate = new Date(info.date);
                    let dateStr = gettext("weekday" + headerDate.getDay()) + ", " + headerDate.getDate() + " " + gettext("month" + headerDate.getMonth());
                    tile.getElementById(elements.HEADER_DATE_ELEMENT).text = dateStr;
                } else if (info.type === elements.EVENT_LIST_EVENT_TYPE) {
                    configureEventTile(tile, info);
                    tile.onclick = function () {
                        let overlay = document.getElementById(elements.OVERLAY_ELEMENT)
                        loadOverlay(overlay, tile);
                        overlay.style.display = "inline";
                    };
                } else if (info.type === elements.EVENT_LIST_FOOTER_TYPE) {
                    if (fs.existsSync(LAST_UPDATE_FILE)) {
                        let lastUpdate = parseInt(fs.readFileSync(LAST_UPDATE_FILE, "ascii"));
                        let duration = formatDuration(new Date(lastUpdate), new Date());
                        let message = gettext("lastUpdate");
                        message = message.replace("{duration}", duration);
                        tile.getElementById(elements.LAST_UPDATE_ELEMENT).text = message;
                    }
                    tile.onclick = function () {
                        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
                            messaging.peerSocket.send({ key: msgTypes.MESSAGE_KEY_UPDATE });
                        }
                    }
                }
            }
        };
        tileList.length = this.eventList.length;
        tileList.redraw();
    }
};

/* Private methods */
function configureEventTile(tile, event) {
    let timeHeight = configureEventTime(tile, event.event);
    let summaryHeight = configureEventSummary(tile, event.event);
    let locationHeight = configureEventLocation(tile, event.event);
    tile.getElementById(elements.CALENDAR_ID_ELEMENT).style.fill = event.event.color;

    let tileHeight = tile.getElementById(elements.HEADER_LINE_ELEMENT).y1;
    tileHeight += timeHeight;
    tileHeight += summaryHeight;
    tileHeight += locationHeight;

    tile.getElementById(elements.FOOTER_LINE_ELEMENT).y1 = tileHeight;
    tile.getElementById(elements.FOOTER_LINE_ELEMENT).y2 = tileHeight;

    tile.getElementById(elements.FOOTER_BLACK_ELEMENT).y = tileHeight - tile.getElementById(elements.FOOTER_BLACK_ELEMENT).height;
    tileHeight += tile.getElementById(elements.FOOTER_BLACK_ELEMENT).height;
    tile.height = tileHeight + 2;
}

function configureEventTime(tile, event) {
    if (event.allDay === false) {
        tile.getElementById(elements.EVENT_TIME_ELEMENT).style.display = "inline";
        tile.getElementById(elements.EVENT_DURATION_ELEMENT).style.display = "inline";
        tile.getElementById(elements.EVENT_TIME_ELEMENT).text = formatTime(new Date(event.start));
        tile.getElementById(elements.EVENT_DURATION_ELEMENT).text = formatDuration(event.start, event.end);
        return tile.getElementById(elements.EVENT_TIME_ELEMENT).height;
    } else {
        tile.getElementById(elements.EVENT_TIME_ELEMENT).style.display = "none";
        tile.getElementById(elements.EVENT_DURATION_ELEMENT).style.display = "none";
        return 0;
    }
}

function configureEventSummary(tile, event) {
    tile.getElementById(elements.EVENT_SUMMARY_ELEMENT).text = event.summary;
    tile.getElementById(elements.EVENT_SUMMARY_PLACEHOLDER).style.display = "none";
    let summaryHeight = tile.getElementById(elements.EVENT_SUMMARY_PLACEHOLDER).height;
    if (tile.getElementById(elements.EVENT_SUMMARY_ELEMENT).textOverflowing) {
        tile.getElementById(elements.EVENT_SUMMARY_ELEMENT).height = tile.getElementById(elements.EVENT_SUMMARY_PLACEHOLDER).height * 2;
        tile.getElementById(elements.EVENT_SUMMARY_PLACEHOLDER).style.display = "inline";
        summaryHeight += tile.getElementById(elements.EVENT_SUMMARY_PLACEHOLDER).height;
    }
    return summaryHeight;
}

function configureEventLocation(tile, event) {
    tile.getElementById(elements.EVENT_LOCATION_ELEMENT).text = event.location;
    return tile.getElementById(elements.EVENT_LOCATION_ELEMENT).height - 2;
}

function loadOverlay(overlay, tile) {
    overlay.getElementById(elements.OVERLAY_SUMMARY_ELEMENT).text = tile.getElementById(elements.EVENT_SUMMARY_ELEMENT).text;
    overlay.getElementById(elements.OVERLAY_SUMMARY_ELEMENT).style.fill = tile.getElementById(elements.CALENDAR_ID_ELEMENT).style.fill;
    overlay.getElementById(elements.OVERLAY_LOCATION_ELEMENT).text = tile.getElementById(elements.EVENT_LOCATION_ELEMENT).text;
    overlay.getElementById(elements.OVERLAY_TIME_ELEMENT).text = tile.getElementById(elements.EVENT_TIME_ELEMENT).text;
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