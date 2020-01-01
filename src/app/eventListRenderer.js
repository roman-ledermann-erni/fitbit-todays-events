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
                if (info.type === elements.EVENT_LIST_HEADER_ITEM) {
                    let itemDate = new Date(info.date);
                    let dateStr = gettext("weekday_short" + itemDate.getDay()) + ", " + itemDate.getDate() + " " + gettext("month_short" + itemDate.getMonth());
                    tile.getElementById(elements.DATE_ITEM_DATE_ELEMENT).text = dateStr;
                    tile.getElementById(elements.DATE_ITEM_EVENTS_ELEMENT).text = gettext("numberOfEvents").replace("{eventNr}", info.events);
                } else if (info.type === elements.EVENT_LIST_EVENT_ITEM) {
                    configureEventTile(tile, info);
                    tile.onclick = evt => {
                        let overlay = document.getElementById(elements.OVERLAY_ELEMENT)
                        configureOverlay(overlay, info.event);
                        overlay.style.display = "inline";
                    };
                } else if (info.type === elements.EVENT_LIST_UPDATE_ITEM) {
                    if (fs.existsSync(LAST_UPDATE_FILE)) {
                        let lastUpdate = parseInt(fs.readFileSync(LAST_UPDATE_FILE, "ascii"));
                        let duration = formatDuration(new Date().getTime() - new Date(lastUpdate).getTime());
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
    let timeHeight = configureEventTime(tile, event.event, event.duration);
    let summaryHeight = configureEventSummary(tile, event.event);
    let locationHeight = configureEventLocation(tile, event.event);
    tile.getElementById(elements.EVENT_ITEM_CALID_ELEMENT).style.fill = event.event.color;

    let tileHeight = tile.getElementById(elements.HEADER_LINE_ELEMENT).y1;
    tileHeight += timeHeight;
    tileHeight += summaryHeight;
    tileHeight += locationHeight;

    let spacerElements = tile.getElementsByClassName(elements.EVENT_ITEM_SPACER_CLASS);
    spacerElements.forEach(spacer => {
        tileHeight += spacer.height;
    });

    tile.getElementById(elements.FOOTER_LINE_ELEMENT).y1 = tileHeight;
    tile.getElementById(elements.FOOTER_LINE_ELEMENT).y2 = tileHeight;

    tile.getElementById(elements.FOOTER_BLACK_ELEMENT).y = tileHeight - tile.getElementById(elements.FOOTER_BLACK_ELEMENT).height;
    tileHeight += tile.getElementById(elements.FOOTER_BLACK_ELEMENT).height;
    tile.height = tileHeight + 3;
}

function configureEventTime(tile, event, duration) {
    if (event.allDay === false) {
        tile.getElementById(elements.EVENT_ITEM_TIME_ELEMENT).text = formatTime(new Date(event.start));
        tile.getElementById(elements.EVENT_ITEM_DURATION_ELEMENT).text = formatDuration(duration);
    } else {
        tile.getElementById(elements.EVENT_ITEM_TIME_ELEMENT).text = gettext("allDay");
        tile.getElementById(elements.EVENT_ITEM_DURATION_ELEMENT).text = formatAllDayDuration(duration);
    }
    return tile.getElementById(elements.EVENT_ITEM_TIME_ELEMENT).height;
}

function configureEventSummary(tile, event) {
    tile.getElementById(elements.EVENT_ITEM_SUMMARY_ELEMENT).text = event.summary;
    tile.getElementById(elements.EVENT_ITEM_SUMMARY_PLACEHOLDER).style.display = "none";
    let summaryHeight = tile.getElementById(elements.EVENT_ITEM_SUMMARY_PLACEHOLDER).height;
    if (tile.getElementById(elements.EVENT_ITEM_SUMMARY_ELEMENT).textOverflowing) {
        tile.getElementById(elements.EVENT_ITEM_SUMMARY_ELEMENT).height = tile.getElementById(elements.EVENT_ITEM_SUMMARY_PLACEHOLDER).height * 2;
        tile.getElementById(elements.EVENT_ITEM_SUMMARY_PLACEHOLDER).style.display = "inline";
        summaryHeight += tile.getElementById(elements.EVENT_ITEM_SUMMARY_PLACEHOLDER).height;
    }
    return summaryHeight;
}

function configureEventLocation(tile, event) {
    if (event.location.length > 0) {
        tile.getElementById(elements.EVENT_ITEM_LOCATION_ELEMENT).style.display = "inline";
        tile.getElementById(elements.EVENT_ITEM_LOCATION_ELEMENT).text = event.location;
        return tile.getElementById(elements.EVENT_ITEM_LOCATION_ELEMENT).height - 2;
    } else {
        tile.getElementById(elements.EVENT_ITEM_LOCATION_ELEMENT).style.display = "none";
        return -2
    }
}

function configureOverlay(overlay, event) {
    overlay.getElementById(elements.OVERLAY_SUMMARY_ELEMENT).text = event.summary;
    overlay.getElementById(elements.OVERLAY_SUMMARY_ELEMENT).style.fill = event.color;
    overlay.getElementById(elements.OVERLAY_TIME_ELEMENT).text = event.start
    if (event.location.length > 0) {
        overlay.getElementById(elements.OVERLAY_LOCATION_ELEMENT).text = gettext("location") + " " + event.location;
    } else {
        overlay.getElementById(elements.OVERLAY_LOCATION_ELEMENT).text = "";
    }
    overlay.getElementById(elements.OVERLAY_CALENDAR_ELEMENT).text = gettext("calendar") + " " + event.cal;
}

function toTwoDigit(num) { return ("0" + num).slice(-2); }

function formatTime(date) {
    return toTwoDigit(date.getHours()) + ":" + toTwoDigit(date.getMinutes());
}

function formatDuration(duration) {
    duration = Math.round(duration / 1000 / 60);
    if (duration >= 1440) {
        duration = Math.round(duration / 60 / 24);
        return duration + gettext("days_short");
    } else if (duration > 90) {
        if (duration % 60 == 0) {
            duration = (duration / 60).toFixed(0);    
        } else {
            duration = (duration / 60).toFixed(1);
        }
        return duration + gettext("hours_short");
    } else {
        return duration + gettext("minutes_short");
    }
}

function formatAllDayDuration(duration) {
    duration = Math.round(duration / 1000 / 60);

    if (duration > 1440) {
        duration = Math.round(duration / 60 / 24);
        return "+" + duration + gettext("days_short");
    } else {
        return "";
    }
}