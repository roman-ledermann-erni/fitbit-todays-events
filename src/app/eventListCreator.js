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
            let headerDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + counter);
            let headerDayAdded = false;
            this.events.forEach(event => {
                let startDay = new Date(event.start);
                startDay = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
                let endDay = new Date(event.end);
                endDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
                if (headerDay.getTime() === startDay.getTime() || headerDay.getTime() === endDay.getTime()) {
                    if (headerDayAdded == false) {
                        tileList.push({
                            type: "date-header-pool",
                            date: headerDay.getTime()
                        });
                        headerDayAdded = true;
                    }
                    tileList.push({ type: "event-item-pool", event: event, });
                }
            });
        }
        return tileList;
    }
};