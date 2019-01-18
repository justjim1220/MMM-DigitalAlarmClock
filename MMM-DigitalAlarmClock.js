/* MagicMIrror Module - MMM-DigitalAlarmClock
 *
 * This is a module for the MagicMirror² By Michael Teeuw http://michaelteeuw.nl
 * (https://github.com/MichMich/MagicMirror/).
 *
 * The digital only part of the default MM2 clock
 * written by Michael Teeuw http://michaelteeuw.nl]
 *
 * Integrated with MMM-AlarmClock by @fewieden
 *
 * I was shooting for this to have the look of the
 * "old school" or vintage digital alarm clocks!
 *
 * Most of the ones I remember came in red, blue, white, or green
 * Of course, you are welcome to choose whatever color or
 * color combination you want.
 *
 * NOT tested with Raspberry Pi
 * It DOES work with Windows 10 AND Ubuntu!!!
 *
 * version: 1.0.0
 *
 * Modified module by Jim Hallock (justjim1220@gmail.com)
 *
 * Licensed with a crapload of good ole' Southern Sweet Tea
 * and a lot of Cheyenne Extreme Menthol cigars!!!
 */

Module.register("MMM-DigitalAlarmClock", {
	next: null,
	alarmFired: false,
	timer: null,
	fadeInterval: null,

	defaults: {
		timeFormat: config.timeFormat,
		showDate: true,
		showWeek: false,
		dateFormat: "ddd ll",
		timezone: "America/Chicago",
		alarmSet: null,
		alarms: [{
			time: "09:30",
			days: [1, 2, 3, 4, 5]
		}],
		sound: "alarm.mp3",
		touch: false,
		popup: true,
		volume: 1.0,
		format: "ddd h:mm a",
		timer: 60 * 1000,
		fade: false,
		fadeTimer: 60 * 1000,
		fadeStep: 0.005
	},

	requiresVersion: "2.1.0",


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "moment-timezone.js"];
	},

	// Define styles.
	getStyles: function() {
		return ["MMM-DigitalAlarmClock.css", "font-awesome.css"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Schedule update interval.
		const self = this;
		setInterval(function() {
			self.updateDom();
		}, 1000);

		this.setNextAlarm();
		setInterval(() => {
			this.checkAlarm();
		}, 1000);

		"use strict",

		// Set locale.
		moment.locale(config.language);
	},

	notificationReceived(notification) {
		if (notification === "STOP_ALARM") {
			this.resetAlarmClock()
		}
	},

	checkAlarm() {
		if (!this.alarmFired && this.next && moment().diff(this.next.moment) >= 0) {
			const alert = {
				imageFA: "bell-o@fa",
				title: this.next.sender || this.next.title,
				message: this.next.message
			};
			let timer = this.config.timer;
			// If the alarm has specific timer and if MM is not touch, we use the alarm timer.
			if (typeof this.next.timer !== "undefined" && !this.config.touch) {
				timer = this.next.timer;
			}
			if (!this.config.touch) {
				alert.timer = timer;
			}
			if (this.config.popup) {
				this.sendNotification("SHOW_ALERT", alert);
			}
			this.alarmFired = true;
			this.updateDom();
			this.timer = setTimeout(() => {
				this.resetAlarmClock();
			}, timer);
			if (this.config.touch && this.config.popup) {
				MM.getModules().enumerate(module => {
					if (module.name === "alert") {
						module.alerts["MMM-DigitalAlarmClock"].ntf.addEventListener("click", () => {
							this.resetAlarmClock();
						});
					}
				});
			}
			setTimeout(() => {
				const player = document.getElementById("MMM-AlarmClock-Player");
				player.volume = this.config.fade ? 0 : this.config.volume;
				this.fadeAlarm();
			}, 100);
		}
	},

	fadeAlarm() {
		let volume = 0;
		let counter = 0;
		this.fadeInterval = setInterval(() => {
			const player = document.getElementById("MMM-DigitalAlarmClock-Player");
			player.volume = volume;
			volume += this.config.fadeStep;
			counter += 1000;
			if (volume >= this.config.volume || counter >= this.config.fadeTimer) {
				player.volume = this.config.volume;
				clearInterval(this.fadeInterval);
			}
		}, 1000);
	},

	setNextAlarm() {
		this.next = null;
		for (let i = 0; i < this.config.alarms.length; i += 1) {
			const temp = this.getMoment(this.config.alarms[i]);
			if (!this.next || temp.diff(this.next.moment) < 0) {
				this.next = this.config.alarms[i];
				this.next.moment = temp;
			}
		}
	},

	resetAlarmClock() {
		clearTimeout(this.timer);
		clearTimeout(this.fadeInterval);
		this.alarmFired = false;
		if (this.config.touch && this.config.popup) {
			this.sendNotification("HIDE_ALERT");
		}
		this.setNextAlarm();
		this.updateDom(300);
	},

	getMoment(alarm) {
		const now = moment();
		let difference = Math.min();
		const hour = parseInt(alarm.time.split(":")[0]);
		const minute = parseInt(alarm.time.split(":")[1]);

		for (let i = 0; i < alarm.days.length; i += 1) {
			if (now.day() < alarm.days[i]) {
				difference = Math.min(alarm.days[i] - now.day(), difference);
			} else if (now.day() === alarm.days[i] && (parseInt(now.hour()) < hour ||
				(parseInt(now.hour()) === hour && parseInt(now.minute()) < minute))) {
				difference = Math.min(0, difference);
			} else if (now.day() === alarm.days[i]) {
				difference = Math.min(7, difference);
			} else {
				difference = Math.min((7 - now.day()) + alarm.days[i], difference);
			}
		}

		return moment().add(difference, "days").set({
			hour,
			minute,
			second: 0,
			millisecond: 0
		});
	},

	button(onclick) {
		const audio = document.getElementsByTagName("audio");
		if (!audio.paused) {
			audio.pause(onclick);
			audio.currentTime = 0;
		}
	},

	getDom: function() {

		const wrapper = document.createElement("div");

		// Date section
		const dateWrapper = document.createElement("div");
		dateWrapper.classList.add("medium");

		const date = document.createElement("span");
		const now = moment();
		date.className = "date";
		date.innerHTML = now.format(this.config.dateFormat);
		dateWrapper.appendChild(date);

		// Time section
		const timeWrapper = document.createElement("div");
		timeWrapper.classList.add("large");

		const time = document.createElement("span");
		time.className = "time";
		if (this.config.timezone) {
			now.tz(this.config.timezone);
		}

		const hourSymbol = "HH";
		if (this.config.timeFormat !== 24) {
			hourSymbol = "h";
		}

		const colonSymbol = ":";
		colonSymbol.className = "colon";

		const timeString = now.format(hourSymbol + colonSymbol + "mm");
		time.innerHTML = timeString;
		timeWrapper.appendChild(time);

		// Alarm section
		const alarmWrapper = document.createElement("div");
		alarmWrapper.classList.add("large");

		const alarm = document.createElement("tr");
		alarm.className = "alarm";

		const pwrBtn = document.createElement("img");
		pwrBtn.className = "onoff";
		pwrBtn.id = "powerBtn";
		pwrBtn.addEventListener("click", () => {
			if (this.config.alarmSet !=false) {
				this.config.alarmSet = true;
			} else if (this.config.alarmSet !=true) {
				this.config.alarmSet = false;
			}
		});

		if (this.config.alarmSet === true) {
			pwrBtn.innerHTML = "<img class=image src=./modules/MMM-DigitalAlarmClock/on.png width=10% valign=middle>&nbsp;&nbsp;";
		} else {
			pwrBtn.innerHTML = "<img class=image src=./modules/MMM-DigitalAlarmClock/off.png width=10% valign=middle>&nbsp;&nbsp;";
		}
		alarmWrapper.appendChild(pwrBtn);

		if (this.config.alarmSet === true) {
			alarm.classList.add("fa", "fa-bell-o", "bell");
		} else {
			alarm.classList.add("fa", "fa-bell-slash-o", "bell");
		}
		alarmWrapper.appendChild(alarm);

		const alarmSet = document.createElement("span");
		alarmSet.className = "set";
		if (this.config.alarmSet === true) {
			alarmSet.classList.add("medium");
			alarmSet.innerHTML = `&nbsp;&nbsp;${this.next.moment.format(this.config.format)}&nbsp&nbsp`;
		} else {
			alarmSet.innerHTML = "&nbsp;&nbsp;";
		}
		alarmWrapper.appendChild(alarmSet);

		const setButton = document.createElement("span");
		setButton.className = "button";
		if (this.config.alarmSet === true) {
			setButton.innerHTML = "Alarm Set";
		} else {
			setButton.innerHTML = "Alarm NOT Set";
		}
		alarmWrapper.appendChild(setButton);

		if (this.alarmFired) {
			const sound = document.createElement("audio");
			sound.className = "alarmSound";
			let srcSound = this.config.sound;
			if (this.next.sound) {
				srcSound = this.next.sound;
			}
			if (!srcSound.match(/^https?:\/\//)) {
				srcSound = this.file(`sounds/${srcSound}`);
			}
			sound.src = srcSound;
			sound.volume = this.config.volume;
			sound.setAttribute("id", "MMM-DigitalAlarmClock-Player");
			sound.volume = this.config.fade ? 0 : this.config.volume;
			sound.setAttribute("autoplay", true);
			sound.setAttribute("loop", true);
			if (this.config.fade === true) {
				this.fadeAlarm();
			}
			alarmWrapper.appendChild(sound);
		}

		const weekWrapper = document.createElement("div");
		weekWrapper.className = "week";
		if (this.config.showWeek) {
			weekWrapper.innerHTML = this.translate("WEEK", { weekNumber: now.week() });
		}

		digitalWrapper = document.createElement("div");
		digitalWrapper.className = "digital";
		digitalWrapper.appendChild(dateWrapper);
		digitalWrapper.appendChild(timeWrapper);
		digitalWrapper.appendChild(alarmWrapper);
		digitalWrapper.appendChild(weekWrapper);

		wrapper.appendChild(digitalWrapper);

		return wrapper;
	}
});

console.log(this.module);
