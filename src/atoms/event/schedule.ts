import { atom } from "jotai";
import { eventConfigAtom, updateEventConfigAtom } from "./config";

export const schedulesAtom = atom((get) => {
	const config = get(eventConfigAtom);

	return config?.schedules ?? [];
});

export const setCurrentItemAtom = atom(
	null,
	async (get, set, dayIdx: number, itemIdx: number) => {
		const schedules = get(schedulesAtom);
		if (!schedules) return;

		// sets all items prior to the specified dayIdx and itemIdx to ended
		// the specified item to ongoing
		// and all items after to upcoming
		const newSchedules = schedules.map((schedule, dIdx) => ({
			...schedule,
			items: schedule.items.map((item, iIdx) => {
				let state: "ended" | "ongoing" | "upcoming";

				if (dIdx < dayIdx || (dIdx === dayIdx && iIdx < itemIdx)) {
					state = "ended";
				} else if (dIdx === dayIdx && iIdx === itemIdx) {
					state = "ongoing";
				} else {
					state = "upcoming";
				}

				return { ...item, state };
			}),
		}));

		set(updateEventConfigAtom, { schedules: newSchedules });
	},
);

export const rescheduleItemAtom = atom(
	null,
	async (get, set, dayIdx: number, itemIdx: number, newTime: string) => {
		const schedules = get(schedulesAtom);
		if (!schedules) return;

		const newSchedules = schedules.map((schedule, dIdx) => ({
			...schedule,
			items: schedule.items.map((item, iIdx) => {
				if (dIdx === dayIdx && iIdx === itemIdx) {
					return {
						...item,
						oldTime: item.time,
						time: newTime,
					};
				}
				return item;
			}),
		}));

		set(updateEventConfigAtom, { schedules: newSchedules });
	},
);
