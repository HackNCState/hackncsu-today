import { firestoreService } from "@/services/firestore.service";
import type { EventConfig } from "@/types/event";
import { atom } from "jotai";

// undefined = loading, null = no config (should create one i reckon), EventConfig = config
export const eventConfigAtom = atom<EventConfig | null | undefined>(undefined);

eventConfigAtom.onMount = (set) => {
	const unsubscribe = firestoreService.onEventConfigChange((data) => {
		set(data);
	});
	return () => unsubscribe();
};

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
