import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { firestoreService } from "@/services/firestore.service";

export const announcementsAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.announcements ?? [];
});

export const deleteAnnouncementAtom = atom(
	null,
	async (get, _, index: number) => {
		const announcements = get(announcementsAtom);
		if (!announcements) return;

		const updatedAnnouncements = announcements.filter((_, i) => i !== index);

		await firestoreService.updateEventConfig({
			announcements: updatedAnnouncements,
		});
	},
);