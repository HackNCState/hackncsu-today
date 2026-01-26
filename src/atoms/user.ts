/**
 * Atom to store user authentication and profile data.
 *
 * (the atoms are read by components and other atoms)
 */

import { atom } from "jotai";
import type { User as FirebaseUser } from "firebase/auth";
import type { ChecklistItemStatus, UserData } from "@/types/user";
import { firestoreService } from "@/services/firestore.service";

// undefined = loading, null = not authenticated, UserData = authenticated
export const userAtom = atom<UserData | null | undefined>(undefined);

export const firebaseUserAtom = atom<FirebaseUser | null>(null);

export const isOrganizerAtom = atom((get) => {
	const user = get(userAtom);
	return user?.role === "organizer";
});

export const teamIdAtom = atom((get) => {
	const user = get(userAtom);
	return user?.role === "participant" ? user.teamId : null;
});

export const completedChecklistStatusesAtom = atom((get) => {
	const user = get(userAtom);
	if (user?.role !== "participant") return [];
	return user.checklistItemStatuses;
});

export const setChecklistStatusAtom = atom(
	null,
	async (get, _, id: string, checked: boolean) => {
		const user = get(userAtom);
		if (!user || user.role !== "participant") return;

		const existingStatuses = user.checklistItemStatuses;

		const filteredStatuses = existingStatuses.filter(
			(status) => status.id !== id,
		);

		const updatedStatuses: ChecklistItemStatus[] = checked
			? [...filteredStatuses, { id, completed: true }]
			: filteredStatuses;

		await firestoreService.updateUser(user.id, {
			checklistItemStatuses: updatedStatuses,
		});
	},
);

export const debugSwitchUserRoleAtom = atom(
	null,
	async (get, set, role: "organizer" | "participant") => {
		const user = get(userAtom);
		if (!user) return;

		await firestoreService.debugSetUserType(user.id, role);

		const updatedUser = await firestoreService.fetchUser(user.id);
		set(userAtom, updatedUser);
	},
);
