import type { EventConfig } from "@/types/event";
import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const hackingStateAtom = atom<EventConfig["hackingState"] | null>(
	(get) => {
		const config = get(eventConfigAtom);
		if (!config) return null;

		return config.hackingState;
	},
);
