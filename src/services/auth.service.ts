import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { functionsService } from "./functions.service";

// the email is saved so the user doesn't have to retype it when they open the link
// (if they open it on a different device, /auth will ask for it again)
const emailStorageKey = "emailForSignIn";

export const authService = {
	// the backend checks the user is allowed to log in, then emails the link via SendGrid
	sendLoginLink: async (email: string) => {
		const normalized = email.trim().toLowerCase();
		await functionsService.sendLoginLink(normalized);
		window.localStorage.setItem(emailStorageKey, normalized);
	},

	isLoginLink: (url: string) => isSignInWithEmailLink(auth, url),

	getSavedEmail: () => window.localStorage.getItem(emailStorageKey),

	completeLogin: async (email: string, url: string) => {
		const credential = await signInWithEmailLink(auth, email, url);
		window.localStorage.removeItem(emailStorageKey);
		return credential;
	},

	logout: async () => auth.signOut(),

	isAuthenticated: () => auth.currentUser !== null,

	getCurrentUser: () => auth.currentUser,
};
