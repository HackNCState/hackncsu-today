import { firestoreService } from "@/services/firestore.service";
import type { Resource } from "@/types/event";
import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const resourcesAtom = atom((get) => {
	const config = get(eventConfigAtom);
	const resources = config?.resources ?? [];
	const tracks = config?.tracks ?? [];
	const challenges = config?.challenges ?? [];

	// straight up hardcoding the tracks and challenges resource here to always be in sync 😭😭
	let tracksContent = tracks
		.map((t) => {
			const isRestricted = t.allowedUniversities && t.allowedUniversities.length > 0;
			const desc = t.fullDescription || t.description || "";
			let entry = `**${t.name}**${isRestricted ? "*" : ""}`;
			if (desc) entry += `  \n${desc}`;
			if (isRestricted) {
				entry += `  \n*\\* this track is restricted to students of: ${t.allowedUniversities.join(", ")}*`;
			}
			return entry;
		})
		.join("\n\n");
	tracksContent = `Select the track that best fits your project. You can only submit to one track.\n\n${tracksContent}`;

	let challengesContent = challenges
		.map((c) => {
			const desc = c.fullDescription || c.description || "";
			let entry = `**${c.name}**`;
			if (desc) entry += `  \n${desc}`;
			return entry;
		})
		.join("\n\n");
	challengesContent = `Participate in these additional challenges for extra prizes.\n\n*You can only choose one challenge. However, you can choose to participate in any additional MLH challenges as well.*\n\n${challengesContent}`;

	const newResources = [...resources];

	// handle Tracks resource
	const tracksResourceIndex = newResources.findIndex(
		(r) => r.label === "Tracks",
	);

	if (tracksResourceIndex !== -1) {
		newResources[tracksResourceIndex] = {
			...newResources[tracksResourceIndex],
			type: "text",
			content: tracksContent,
		};
	} else {
		newResources.push({
			type: "text",
			label: "Tracks",
			content: tracksContent,
			hidden: false,
		} as Resource);
	}

	// handle Challenges resource
	const challengesResourceIndex = newResources.findIndex(
		(r) => r.label === "Challenges",
	);

	if (challengesResourceIndex !== -1) {
		newResources[challengesResourceIndex] = {
			...newResources[challengesResourceIndex],
			type: "text",
			content: challengesContent,
		};
	} else {
		newResources.push({
			type: "text",
			label: "Challenges",
			content: challengesContent,
			hidden: false,
		} as Resource);
	}

	return newResources;
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

		const updatedResources = [...resources, resource];

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
export const reorderResourceAtom = atom(
	null,
	async (
		get,
		_,
		payload: { fromIndex: number; toIndex: number },
	) => {
		const resources = get(resourcesAtom);
		if (!resources) return;

		const { fromIndex, toIndex } = payload;
		if (
			fromIndex < 0 ||
			fromIndex >= resources.length ||
			toIndex < 0 ||
			toIndex >= resources.length
		)
			return;

		const updated = [...resources];
		const [moved] = updated.splice(fromIndex, 1);
		updated.splice(toIndex, 0, moved);

		await firestoreService.updateEventConfig({ resources: updated });
	},
);

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
