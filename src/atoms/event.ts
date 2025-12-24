import { firestoreService } from "@/services/firestore.service";
import type { EventConfig } from "@/types/event";
import { atom } from "jotai";

// undefined = loading, null = no config (should create one i reckon), EventConfig = config
export const eventConfigAtom = atom<EventConfig | null | undefined>(undefined);

export const updateEventConfigAtom = atom(
	null,
	async (_, __, updatedConfig: Partial<EventConfig> | null) => {
		if (updatedConfig === null) {
			await firestoreService.clearEventConfig();
			return;
		}

		await firestoreService.updateEventConfig(updatedConfig);
	},
);

export const announcementsAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.announcements ?? [];
});

export const deleteAnnouncementAtom = atom(
	null,
	async (get, _, index: number) => {
		const announcements = get(announcementsAtom);
		if (!announcements) return;

		const updatedAnnouncements = announcements.filter(
			(_, i) => i !== index,
		);

		const updatedConfig = {
			announcements: updatedAnnouncements,
		};

		await firestoreService.updateEventConfig(updatedConfig);
	},
);
