import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { tickAtom } from "../tick";

interface Countdown {
	hours: number;
	minutes: number;
	seconds: number;
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
		};
	}

	const diff = endTime.getTime() - now.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return {
		hours,
		minutes,
		seconds,
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

