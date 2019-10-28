import { gettext } from "i18n";

function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">{gettext("settings.calsection.title")}</Text>}>
        <Text align="center">{gettext("settings.calendar.title")} 1</Text>
        <TextInput settingsKey="cal0Name" label={gettext("settings.calendar.name")} type="text" />
        <TextInput settingsKey="cal0Url" label={gettext("settings.calendar.url")} type="text" />
        <ColorSelect settingsKey="cal0Color"
          colors={[
            {color: 'blue'},
            {color: 'turquoise'},
            {color: 'green'},
            {color: 'indigo'},
            {color: 'violet'},
            {color: 'magenta'},
            {color: 'orange'},
            {color: 'red'},
            {color: 'grey'}
          ]}
        />

        <Text align="center">{gettext("settings.calendar.title")} 2</Text>
        <TextInput settingsKey="cal1Name" label={gettext("settings.calendar.name")} type="text" />
        <TextInput settingsKey="cal1Url" label={gettext("settings.calendar.url")} type="text" />
        <ColorSelect settingsKey="cal1Color"
          colors={[
            {color: 'blue'},
            {color: 'turquoise'},
            {color: 'green'},
            {color: 'indigo'},
            {color: 'violet'},
            {color: 'magenta'},
            {color: 'orange'},
            {color: 'red'},
            {color: 'grey'}
          ]}
        />
        
        <Text align="center">{gettext("settings.calendar.title")} 3</Text>
        <TextInput settingsKey="cal2Name" label={gettext("settings.calendar.name")} type="text" />
        <TextInput settingsKey="cal2Url" label={gettext("settings.calendar.url")} type="text" />
        <ColorSelect settingsKey="cal2Color"
          colors={[
            {color: 'blue'},
            {color: 'turquoise'},
            {color: 'green'},
            {color: 'indigo'},
            {color: 'violet'},
            {color: 'magenta'},
            {color: 'orange'},
            {color: 'red'},
            {color: 'grey'}
          ]}
        />
        
        <Text align="center">{gettext("settings.calendar.title")} 4</Text>
        <TextInput settingsKey="cal3Name" label={gettext("settings.calendar.name")} type="text" />
        <TextInput settingsKey="cal3Url" label={gettext("settings.calendar.url")} type="text" />
        <ColorSelect settingsKey="cal3Color"
          colors={[
            {color: 'blue'},
            {color: 'turquoise'},
            {color: 'green'},
            {color: 'indigo'},
            {color: 'violet'},
            {color: 'magenta'},
            {color: 'orange'},
            {color: 'red'},
            {color: 'grey'}
          ]}
        />
        
        <Text align="center">{gettext("settings.calendar.title")} 5</Text>
        <TextInput settingsKey="cal4Name" label={gettext("settings.calendar.name")} type="text" />
        <TextInput settingsKey="cal4Url" label={gettext("settings.calendar.url")} type="text" />
        <ColorSelect settingsKey="cal4Color"
          colors={[
            {color: 'blue'},
            {color: 'turquoise'},
            {color: 'green'},
            {color: 'indigo'},
            {color: 'violet'},
            {color: 'magenta'},
            {color: 'orange'},
            {color: 'red'},
            {color: 'grey'}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
