import { gettext } from "i18n";

function mySettings(props) {
    if (props.settingsStorage.getItem("daysToShow") === undefined) {
        props.settingsStorage.setItem("daysToShow", "2");
    }

    return (
        <Page>
            <Section title={gettext("settings.generalsection.title")}>
                <Select label="Number of days to show events" settingsKey="daysToShow" options={[
                    { name: "One", value: 1 },
                    { name: "Two", value: 2 },
                    { name: "Three", value: 3 },
                    { name: "Four", value: 4 },
                    { name: "Five", value: 5 }]}
                    onSelection={(selection) => console.log(selection.selected)} />
            </Section>

            <Section title={gettext("settings.calsection.title")}>

                <TextInput settingsKey="cal0Name" label={gettext("settings.calendar.name")} type="text" />
                <TextInput settingsKey="cal0Url" label={gettext("settings.calendar.url")} type="text" />
                <ColorSelect settingsKey="cal0Color"
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

                <TextInput settingsKey="cal1Name" label={gettext("settings.calendar.name")} type="text" />
                <TextInput settingsKey="cal1Url" label={gettext("settings.calendar.url")} type="text" />
                <ColorSelect settingsKey="cal1Color"
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

                <TextInput settingsKey="cal2Name" label={gettext("settings.calendar.name")} type="text" />
                <TextInput settingsKey="cal2Url" label={gettext("settings.calendar.url")} type="text" />
                <ColorSelect settingsKey="cal2Color"
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

                <TextInput settingsKey="cal3Name" label={gettext("settings.calendar.name")} type="text" />
                <TextInput settingsKey="cal3Url" label={gettext("settings.calendar.url")} type="text" />
                <ColorSelect settingsKey="cal3Color"
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

                <TextInput settingsKey="cal4Name" label={gettext("settings.calendar.name")} type="text" />
                <TextInput settingsKey="cal4Url" label={gettext("settings.calendar.url")} type="text" />
                <ColorSelect settingsKey="cal4Color"
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
            </Section>
        </Page>
    );
}

registerSettingsPage(mySettings);
