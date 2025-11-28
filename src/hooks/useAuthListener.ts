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
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			setFirebaseUser(firebaseUser);

			if (firebaseUser) {
				try {
					const user = await firestoreService.fetchUser(firebaseUser.uid);
					
                    setUser(user);

                    if (!user) {
                        console.error("User document not found in Firestore");
                    }
				} catch (error) {
					console.error("Error fetching user data:", error);
					setUser(null);
				}
			} else {
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, [setUser, setFirebaseUser]);
}
