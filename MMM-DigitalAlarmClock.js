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
		alarms: [{
			time: "12:00",
			days: [1, 2, 3, 4, 5],
            title: "GET UP!!!",
            message: "Get Your Ass Outta Bed!!!"
		}],
		sound: "alarm.mp3",
		touch: false,
		volume: 1.0,
		format: "ddd <br> h:mm <br> a",
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
		moment.locale(config.language);

		"use strict",

		// Set locale.
		moment.locale(config.language);
	},

	checkAlarm() {
		if (!this.alarmFired && this.next && moment().diff(this.next.moment) >= 0) {
			const alert = {
				imageFA: "bell@fa",
				title: this.next.sender || this.next.title,
				message: this.next.message
			};
			if (!this.config.touch) {
				alert.timer = this.config.timer;
			}
			this.sendNotification("SHOW_ALERT", alert);
			this.alarmFired = true;
			this.updateDom(300);
			this.timer = setTimeout(() => {
				this.resetAlarmClock();
			}, this.config.timer);
			if (this.config.touch) {
				MM.getModules().enumerate((module) => {
					if (module.name === "alert") {
						module.alerts["MMM-DigitalAlarmClock"].ntf.addEventListener("click", () => {
							clearTimeout(this.timer);
							clearTimeout(this.fadeInterval);
							this.resetAlarmClock();
						});
					}
				});
			}
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
		this.alarmFired = false;
		if (this.config.touch) {
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

	getDom: function () {

		const wrapper = document.createElement("div");

		const dateWrapper = document.createElement("div");
		dateWrapper.classList.add("xlarge");

		const alarm = document.createElement("td");
		alarm.className = "alarm";
		if (!this.next) {
			alarm.classList.add("fa", "fa-bell-o", "bell");
		} else {
			alarm.classList.add("fa", "fa-bell", "bell");
		}
		dateWrapper.appendChild(alarm);

		const date = document.createElement("span");
		const now = moment();
		date.className = "date";
		date.classList.add("align-right");
		date.innerHTML = "&nbsp;&nbsp;" + now.format(this.config.dateFormat);
		dateWrapper.appendChild(date);

		const timeWrapper = document.createElement("div");
		timeWrapper.classList.add("xlarge");

		const alarmSet = document.createElement("td");
		alarmSet.className = "set";
		if (!this.next) {
			alarmSet.innerHTML = "";
		} else {
			alarmSet.classList.add("xlarge");
			alarmSet.innerHTML = `${this.next.moment.format(this.config.format)}` + "&nbsp;&nbsp;";
		}
		timeWrapper.appendChild(alarmSet);

		const time = document.createElement("span");
		time.className = "time";
		time.classList.add("align-right");
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
		time.innerHTML = "&nbsp;&nbsp;" + timeString;
		timeWrapper.appendChild(time);

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
			timeWrapper.appendChild(sound);
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
		digitalWrapper.appendChild(weekWrapper);

		wrapper.appendChild(digitalWrapper);

		return wrapper;
	}
});

console.log(this.module);
