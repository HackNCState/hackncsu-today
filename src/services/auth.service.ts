import { auth } from "@/lib/firebase-config";
import { signInWithCustomToken } from "firebase/auth";

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

	isAuthenticated: () => auth.currentUser !== null,

	getCurrentUser: () => auth.currentUser,
};
