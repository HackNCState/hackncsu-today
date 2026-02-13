import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { firestoreService } from "@/services/firestore.service";
import type { Track } from "@/types/event";

export const tracksAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.tracks ?? [];
});

export const addTrackAtom = atom(null, async (get, _, track: Track) => {
	const tracks = get(tracksAtom);

	const updatedTracks = [...tracks, track];

	await firestoreService.updateEventConfig({ tracks: updatedTracks });
});

export const deleteTrackAtom = atom(null, async (get, _, index: number) => {
	const tracks = get(tracksAtom);
	if (!tracks) return;

	const updatedTracks = tracks.filter((_, i) => i !== index);

	await firestoreService.updateEventConfig({ tracks: updatedTracks });
});

export const setTrackAtom = atom(
	null,
	async (get, _, payload: { index: number; track: Track }) => {
		const tracks = get(tracksAtom);
		if (!tracks) return;

		const updatedTracks = tracks.map((t, i) =>
			i === payload.index ? payload.track : t,
		);

		await firestoreService.updateEventConfig({ tracks: updatedTracks });
	},
);

// TODO: update to not use firestore service directly (bad practice)
