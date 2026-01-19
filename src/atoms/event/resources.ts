import { firestoreService } from "@/services/firestore.service";
import type { Resource } from "@/types/event";
import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const resourcesAtom = atom((get) => {
	const config = get(eventConfigAtom);
	const resources = config?.resources ?? [];
	const tracks = config?.tracks ?? [];

	// straight up hardcoding the tracks resource here to always be in sync with tracksAtom 😭😭
	const tracksContent = tracks
		.map((t) => `**${t.name}**\\\n${t.description ?? ""}`)
		.join("\n\n");

	const tracksResourceIndex = resources.findIndex((r) => r.label === "Tracks");

	if (tracksResourceIndex !== -1) {
		const newResources = [...resources];
		newResources[tracksResourceIndex] = {
			...newResources[tracksResourceIndex],
			type: "text",
			content: tracksContent,
		};
		return newResources;
	}

	return [
		...resources,
		{
			type: "text",
			label: "Tracks",
			content: tracksContent,
			hidden: false,
		} as Resource,
	];
});

export const visibleResourcesAtom = atom((get) => {
	const resources = get(resourcesAtom);
	return resources.filter((res) => !res.hidden);
});

export const visibleTextResourcesAtom = atom((get) => {
	const resources = get(visibleResourcesAtom);
	return resources.filter((res) => res.type === "text");
});

export const visibleLinkResourcesAtom = atom((get) => {
	const resources = get(visibleResourcesAtom);
	return resources.filter((res) => res.type === "link");
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

// TODO: add reorderResourceAtom?
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
