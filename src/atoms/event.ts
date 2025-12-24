import { firestoreService } from "@/services/firestore.service";
import type { EventConfig, Resource } from "@/types/event";
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

		const updatedAnnouncements = announcements.filter((_, i) => i !== index);

		await firestoreService.updateEventConfig({
			announcements: updatedAnnouncements,
		});
	},
);

export const resourcesAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.resources ?? [];
});

export const addResourceAtom = atom(
	null,
	async (get, _, resource: Resource) => {
		const resources = get(resourcesAtom);

		const updatedResources = [resource, ...resources];

		await firestoreService.updateEventConfig({ resources: updatedResources });
	},
);

export const deleteResourceAtom = atom(null, async (get, _, index: number) => {
	const resources = get(resourcesAtom);
	if (!resources) return;

	const updatedResources = resources.filter((_, i) => i !== index);

	await firestoreService.updateEventConfig({ resources: updatedResources });
});

export const setResourceAtom = atom(
	null,
	async (get, _, payload: { index: number; resource: Resource }) => {
		const resources = get(resourcesAtom);
		if (!resources) return;

		const updatedResources = resources.map((res, i) =>
			i === payload.index ? payload.resource : res,
		);

		await firestoreService.updateEventConfig({ resources: updatedResources });
	},
);
