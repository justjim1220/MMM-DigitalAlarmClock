# Module: MMM-DigitalAlarmClock
A MagicMirror<sup>2</sup> 3rd party modules that combines MMM-DigClock and MMM-AlarmClock in a single module

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
			disabled: false,
			module: "MMM-DigitalAlarmClock",
			position: "top_center",	// This can be any of the regions.
			config: {
				showDate: true,
				showWeek: false,
				timezone: "America/Chicago",
				alarms: [{
					time: "16:35",
					days: [1, 2, 3, 4, 5],
					title: "GET UP!!!",
					message: "Get Your Ass Outta Bed!!!",
					sound: "alarm.mp3"
				}],
			}
		},
]
````

## Configuration options

