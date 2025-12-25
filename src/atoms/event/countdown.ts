import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { tickAtom } from "../tick";

interface Countdown {
    type: "before" | "during" | "ended";
    hours: number;
    minutes: number;
    seconds: number;
}

export const countdownAtom = atom<Countdown | null>((get) => {
    const config = get(eventConfigAtom);
    const now = get(tickAtom);

    if (!config) return null;

    const startTime = new Date(config.hackingStartTime);
    const endTime = new Date(config.hackingEndTime);

    let targetTime: Date;
    let type: Countdown["type"];

    if (now < startTime) {
        type = "before";
        targetTime = startTime;
    } else if (now < endTime) {
        type = "during";
        targetTime = endTime;
    } else {
        return {
            type: "ended",
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
    }

    const diff = targetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
        type,
        hours,
        minutes,
        seconds,
    };
});