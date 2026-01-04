/**
 * A component that uses this hook will listen for authentication state changes
 * and update the user state in Jotai atoms accordingly.
 *
 * (it is used globally in App.tsx so that all components have access to auth state)
 */

import { auth } from "@/lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom, firebaseUserAtom } from "@/atoms/user";
import { firestoreService } from "@/services/firestore.service";

export function useAuthListener() {
	const setUser = useSetAtom(userAtom);
	const setFirebaseUser = useSetAtom(firebaseUserAtom);

	useEffect(() => {
		let unsubscribeUser: (() => void) | undefined;

		const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
			setFirebaseUser(firebaseUser);

			// unsubscribe from previous user listener if exists
			if (unsubscribeUser) {
				unsubscribeUser();
				unsubscribeUser = undefined;
			}

			if (firebaseUser) {
				// if logged in, listen to user document changes
				unsubscribeUser = firestoreService.onUserSnapshot(
					firebaseUser.uid,
					(user) => {
						setUser(user);
						if (!user) {
							console.error("User document not found in Firestore");
						}
					},
				);
			} else {
				setUser(null);
			}
		});

		return () => {
			unsubscribeAuth();
			if (unsubscribeUser) {
				unsubscribeUser();
			}
		};
	}, [setUser, setFirebaseUser]);
}
