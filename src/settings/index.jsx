import { gettext } from "i18n";

function mySettings(props) {
    if (props.settingsStorage.getItem("updateInterval") === undefined) {
        props.settingsStorage.setItem("updateInterval", JSON.stringify({"selected":[1]}));
    }

    if (props.settingsStorage.getItem("calendarList") === undefined) {
        props.settingsStorage.setItem("calendarList", "[]");
    }

    console.log(props.settingsStorage.getItem("updateInterval"));

    var calSettings = [];
    var calendars = JSON.parse(props.settingsStorage.getItem("calendarList"));
    for (let counter = 0; counter < calendars.length; counter++) {
        calSettings.push(<Text bold>{calendars[counter].name}</Text>);
        var calUrlKey = "calUrl" + calendars[counter].name;
        calSettings.push(<TextInput settingsKey={calUrlKey} label={gettext("settings.calendar.url")} type="text" />);
        var calColorKey = "calColor" + calendars[counter].name;
        if (props.settingsStorage.getItem(calColorKey) === undefined) {
            props.settingsStorage.setItem(calColorKey, "blue");
        }
        calSettings.push(
            <ColorSelect settingsKey={calColorKey}
                    colors={[
                        { color: 'blue' },
                        { color: 'turquoise' },
                        { color: 'green' },
                        { color: 'indigo' },
                        { color: 'violet' },
                        { color: 'magenta' },
                        { color: 'orange' },
                        { color: 'red' },
                        { color: 'grey' }
                    ]}
                />
        );
    }

    return (
        <Page>
            <Section title={gettext("settings.generalsection.title")}>
            <Select label={gettext("settings.generalsection.updateInterval")}
                settingsKey="updateInterval"
                options={[
                    {name: gettext("settings.generalsection.halfhourInterval"), value: 30},
                    {name: gettext("settings.generalsection.hourInterval"), value: 60},
                    {name: gettext("settings.generalsection.twohourInterval"), value: 120},
                    {name: gettext("settings.generalsection.threehourInterval"), value: 180},
                    {name: gettext("settings.generalsection.sixhourInterval"), value: 360}
                ]}
                />
            </Section>

            <Section title={gettext("settings.calsection.title")}>
                <AdditiveList title="Calendars"
                    description="Add up to five calendars"
                    settingsKey="calendarList"
                    maxItems="5" />
                {calSettings}
            </Section>
        </Page>
    );
}

registerSettingsPage(mySettings);
