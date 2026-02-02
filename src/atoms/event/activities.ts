import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { firestoreService } from "@/services/firestore.service";
import type { Activity } from "@/types/event";

export const activitiesAtom = atom((get) => {
	const event = get(eventConfigAtom);
	return event?.activities || [];
});

export const addActivityAtom = atom(
	null,
	async (get, _, activity: Activity) => {
		const activities = get(activitiesAtom);

		const updatedActivities = [...activities, activity];

		await firestoreService.updateEventConfig({
			activities: updatedActivities,
		});
	},
);

export const deleteActivityAtom = atom(null, async (get, _, index: number) => {
	const activities = get(activitiesAtom);
	if (!activities) return;

	const updatedActivities = activities.filter((_, i) => i !== index);

	await firestoreService.updateEventConfig({ activities: updatedActivities });
});

export const setActivityAtom = atom(
	null,
	async (get, _, payload: { index: number; activity: Activity }) => {
		const activities = get(activitiesAtom);
		if (!activities) return;

		const updatedActivities = activities.map((activity, i) =>
			i === payload.index ? payload.activity : activity,
		);

		await firestoreService.updateEventConfig({ activities: updatedActivities });
	},
);
