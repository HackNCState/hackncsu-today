import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { firestoreService } from "@/services/firestore.service";
import type { Challenge } from "@/types/event/event";

export const challengesAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.challenges ?? [];
});

export const addChallengeAtom = atom(
	null,
	async (get, _, challenge: Challenge) => {
		const challenges = get(challengesAtom);

		const updatedChallenges = [...challenges, challenge];

		await firestoreService.updateEventConfig({ challenges: updatedChallenges });
	},
);

export const deleteChallengeAtom = atom(null, async (get, _, index: number) => {
	const challenges = get(challengesAtom);
	if (!challenges) return;

	const updatedChallenges = challenges.filter((_, i) => i !== index);

	await firestoreService.updateEventConfig({ challenges: updatedChallenges });
});

export const setChallengeAtom = atom(
	null,
	async (get, _, payload: { index: number; challenge: Challenge }) => {
		const challenges = get(challengesAtom);
		if (!challenges) return;

		const updatedChallenges = challenges.map((t, i) =>
			i === payload.index ? payload.challenge : t,
		);

		await firestoreService.updateEventConfig({ challenges: updatedChallenges });
	},
);
