# Module: MMM-DigitalAlarmClock:

The `clock` module is one of the default modules of the MagicMirror.
This module is a variation only showing the Digital Clock.
I made this because I wanted to be able to use the 'clock' module on separate pages of my Mirror.
This module displays the current date, week, and time. The information will be updated realtime.

## Installing this module:

`$ cd MagicMirror
$ cd modules
$ git clone https://github.com/justjim1220/MMM-DigitalAlarmClock.git
$ cd MMM-DigitalAlarmClock
$ npm i

## Using the module:

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "MMM-DigitalAlarmClock",
		position: "top_center",	// This can be any of the regions.
		config: {
			timezone: "America/Chicago",
			alarmSet: true,
			alarms: [
				{
					time: "09:30",
					days: [1, 2, 3, 4, 5],
					sound: "alarm.mp3",
				}
			],
			sound: "alarm.mp3", // default sound if not set within the alarms section
			touch: false,
			popup: true,
		}
	},
]
````

## Configuration options

The following properties can be configured:

| Option            | Description
| ----------------- | -----------
| `alarmSet`        | to enable or disable the alarm <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `timeFormat`      | Use 12 or 24 hour format. <br><br> **Possible values:** `12` or `24` <br> **Default value:** uses value of _config.timeFormat_
| `displaySeconds`  | Display seconds. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `showPeriod`      | Show the period (am/pm) with 12 hour format. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `showPeriodUpper` | Show the period (AM/PM) with 12 hour format as uppercase. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `clockBold`       | Remove the colon and bold the minutes to make a more modern look. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `showDate`        | Turn off or on the Date section. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `showWeek`        | Turn off or on the Week section. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `dateFormat`      | Configure the date format as you like. <br><br> **Possible values:** [Docs](http://momentjs.com/docs/#/displaying/format/) <br> **Default value:** `"dddd, LL"`
| `timezone`        | Specific a timezone to show clock. <br><br> **Possible examples values:** `America/New_York`, `America/Santiago`, `Etc/GMT+10` <br> **Default value:** `"America/Chicago"` (central time US). See more informations about configuration value [here](https://momentjs.com/timezone/docs/#/data-formats/packed-format/).
| `touch`           | for touch screen, touch alert message box to turn off the alarm. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `popup`           | to show the alert message box on the screen, click to turn off the alarm. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| ----------------- | -----------
| `alarms`          | must be inside [{}], can set as many as needed. See below for example.
| `time`            | must be set in 24hr time. Time shown in module will be how you have it set in your config.js file.
| `days`            | are nubered starting with Sunday = 0 through Saturday = 6.
| `sound`           | can set a different sound for different alarms. See sounds folder for choices, may add your own.
| `title`           | (optional) add a reason for the alarm
| `message`         | (optional) add a message to the alert

 alarms: [
	{
		time: "0600",
		days: [0, 5, 6], // Sun, Fri, Sat
		title: "Weekend - Work",
		message: "Get Up and Go To Work!",
		sound: alarm.mp3
	},
	{
		time: "0900",
		days: [1, 2, 3, 4], // Mon, Tue, Wed, Thu
		message: "TIME TO WORK OUT!!!",
		sound: Tornado_Siren.mp3
	},
	{
		... // CAN ADD AS MANY DIFFERENT ALARMS AS YOU NEED
	}
 ],

==================================================================================

## Acknowledgements:

@MichMich for the default clock module from which this was started
@fewieden for his MMM-AlarmClock module from which was added to the default clock module
@wesdsturdevant for his help with some of the code issues I ran into a few times