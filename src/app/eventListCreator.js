import * as elements from "../common/ui.js";

export class EventListCreator {
    constructor() {
        this.events = [];
    }

    clearEvents() {
        this.events = [];
    }

    addEvent(event) {
        this.events.push(event);
    }

    createTileList() {
        let now = new Date();
        let tileList = [];
        for (let counter = 0; counter <= 5; ++counter) {
            let currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter);
            let currentDayAdded = false;
            let dateItem = null;
            this.events.forEach(event => {
                let startDay = new Date(event.start);
                startDay = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
                let endDay = new Date(event.end);
                endDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
                if (currentDay.getTime() === startDay.getTime() || currentDay.getTime() === endDay.getTime()) {
                    if (currentDayAdded == false) {
                        dateItem = {
                            type: elements.EVENT_LIST_HEADER_ITEM,
                            date: currentDay.getTime(),
                            events: 0
                        }
                        tileList.push(dateItem);
                        currentDayAdded = true;
                    }
                    tileList.push({ type: elements.EVENT_LIST_EVENT_TYPE, event: event });
                    dateItem.events++;
                }
            });
        }
        tileList.push({ type: elements.EVENT_LIST_FOOTER_TYPE });
        return tileList;
    }
};