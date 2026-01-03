/**
 * Atom to store user authentication and profile data.
 *
 * (the atoms are read by components and other atoms)
 */

import { atom } from "jotai";
import type { User as FirebaseUser } from "firebase/auth";
import type { UserData } from "@/types/user";
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
