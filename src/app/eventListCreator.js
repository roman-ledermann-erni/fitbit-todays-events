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
            let currentDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter);
            let currentDateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter + 1);
            let currentDateAdded = false;
            let dateItem = null;
            currentDateStart.sets
            this.events.forEach(event => {
                if (isInDate(event, currentDateStart, currentDateEnd)) {
                    if (currentDateAdded == false) {
                        dateItem = {
                            type: elements.EVENT_LIST_HEADER_ITEM,
                            date: currentDateStart.getTime(),
                            events: 0
                        }
                        tileList.push(dateItem);
                        currentDateAdded = true;
                    }
                    let eventDuration = event.end - event.start;
                    if (event.start < +currentDateStart) {
                        eventDuration = event.end - +currentDateStart;
                    }
                    console.log(event.duration);
                    tileList.push({ type: elements.EVENT_LIST_EVENT_ITEM, event: event, duration: eventDuration });
                    dateItem.events++;
                }
            });
        }
        tileList.push({ type: elements.EVENT_LIST_UPDATE_ITEM });
        return tileList;
    }
};

/* Private methods */
function isInDate(event, currentDateStart, currentDateEnd) {
    let startDate = new Date(event.start);
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let endDate = new Date(event.end);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return (+startDate >= currentDateStart.setSeconds(1) && +startDate <= currentDateEnd.setSeconds(-1)) ||
        (+endDate >= currentDateStart.setSeconds(1) && +endDate <= currentDateEnd.setSeconds(-1)) ||
        (+startDate < currentDateStart.setSeconds(1) && +endDate > currentDateEnd.setSeconds(-1));
}