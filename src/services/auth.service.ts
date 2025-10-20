import { auth } from "@/lib/firebase-config";
import {
	onAuthStateChanged,
	signInWithCustomToken,
	signInWithPopup,
} from "firebase/auth";
import { useEffect, useState } from "react";

const clientId = "1371413608394653736";
const baseUrl = "https://discord.com/api/oauth2/authorize";
const redirectUri = encodeURIComponent(
	import.meta.env.DEV
		? "http://127.0.0.1:5001/hackncsu-today/us-central1/oauth_callback"
		: "https://us-central1-hackncsu-today.cloudfunctions.net/oauth_callback",
);

export const authService = {
	startOAuth: () => {
		window.location.href = `${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify`;
	},

	login: async (token: string) => {
		const credential = await signInWithCustomToken(auth, token);
		return credential;
	},

	logout: async () => auth.signOut(),

	getCurrentUser: () => auth.currentUser,
};

// TODO: Replace w/ atom-based firestore user data
export function useAuth() {
	const [user, setUser] = useState(auth.currentUser);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		return onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});
	}, []);

	return { user, loading };
}
