import { firestore } from "@/lib/firebase-config";
import { UserSchema } from "@/types/user";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const collections = {
	users: "users",
};

export const firestoreService = {
	// this will fail if the user is a participant
	// and they try accessing other user's data
	fetchUser: async (userId: string) => {
		const userDocRef = doc(firestore, collections.users, userId);
		const userSnapshot = await getDoc(userDocRef);

		if (userSnapshot.exists()) {
			return UserSchema.parse(userSnapshot.data());
		}

		return null;
	},

	// this only works in debug mode. useful for testing different user roles
	debugSetUserType: async (
		userId: string,
		type: "organizer" | "participant",
	) => {
		if (import.meta.env.DEV) {
			const userDocRef = doc(firestore, collections.users, userId);
			const userSnapshot = await getDoc(userDocRef);

			if (userSnapshot.exists()) {
				const updatedData = {
					role: type,
				};
				await updateDoc(userDocRef, updatedData);
			}
		}
	},
};
