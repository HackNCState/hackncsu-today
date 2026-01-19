import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { tickAtom } from "../tick";
import { hackingStateAtom } from "./state";

interface Countdown {
	hours: number;
	minutes: number;
	seconds: number;
	totalSeconds: number;
	isMoreThan24Hours: boolean;
}

export const countdownAtom = atom<Countdown | null>((get) => {
	const config = get(eventConfigAtom);
	const now = get(tickAtom);

	if (!config) return null;

	const endTime = new Date(config.hackingEndTime);

	if (now >= endTime) {
		return {
			hours: 0,
			minutes: 0,
			seconds: 0,
			totalSeconds: 0,
			isMoreThan24Hours: false,
		};
	}

	const realDiff = endTime.getTime() - now.getTime();
	let diff = realDiff;
	let isMoreThan24Hours = false;

	if (realDiff > 24 * 60 * 60 * 1000) {
		diff = realDiff - 24 * 60 * 60 * 1000;
		isMoreThan24Hours = true;
	}

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return {
		hours,
		minutes,
		seconds,
		totalSeconds: Math.floor(diff / 1000),
		isMoreThan24Hours,
	};
});

export const countdownStringAtom = atom<string | null>((get) => {
	const countdown = get(countdownAtom);
	if (!countdown) return null;

	const hh = String(countdown.hours).padStart(2, "0");
	const mm = String(countdown.minutes).padStart(2, "0");
	const ss = String(countdown.seconds).padStart(2, "0");

	return `${hh}:${mm}:${ss}`;
});

export const countdownMessageAtom = atom<string>((get) => {
	const countdown = get(countdownAtom);
	const hackingState = get(hackingStateAtom);

	if (!countdown || !hackingState) return "???";

	switch (hackingState) {
		case "setup":
			return "STARTING SOON! PLEASE STAND BY";
		case "countdown":
			if (countdown.isMoreThan24Hours) {
				return "START HACKING IN";
			} else if (countdown.totalSeconds <= 0) {
				return "TIME'S UP!";
			} else if (countdown.totalSeconds <= 60) {
				return "SUBMIT ASAP";
			} else if (countdown.totalSeconds <= 600) {
				return "FINAL CALL";
			} else if (countdown.totalSeconds <= 3600) {
				return "FINISH STRONG";
			} else if (
				countdown.totalSeconds <= 12 * 3600 &&
				countdown.totalSeconds >= 11 * 3600
			) {
				return "HALFWAY THERE";
			} else {
				return "TIME REMAINING";
			}
		case "judging":
			return "JUDGING IN PROGRESS";
		case "ended":
			return "THANK YOU FOR PARTICIPATING!";
	}
});

// will be used to determine urgency-based UI changes
type HackingUrgency =
	| "notHacking"
	| "startingSoon"
	| "ongoing"
	| "lastHour"
	| "last10Minutes"
	| "ended";

export const hackingUrgencyAtom = atom<HackingUrgency>((get) => {
	const hackingState = get(hackingStateAtom);
	const countdown = get(countdownAtom);

	if (!hackingState) return "notHacking";

	if (hackingState !== "countdown") {
		return "notHacking";
	}

	if (!countdown) return "ongoing";

	if (countdown.isMoreThan24Hours) {
		if (countdown.totalSeconds <= 15 * 60) {
			return "startingSoon";
		}
		return "notHacking";
	}

	if (countdown.totalSeconds <= 600) {
		return "last10Minutes";
	}
	if (countdown.totalSeconds <= 3600) {
		return "lastHour";
	}

	return "ongoing";
});
