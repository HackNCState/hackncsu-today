import { signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { z } from "zod";
import { auth, firestore } from "@/lib/firebase-config";

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

	previewLogin: async () => {
		if (!import.meta.env.DEV) {
			throw new Error("Preview login is only available in development.");
		}
		if (auth.currentUser && !auth.currentUser.isAnonymous) {
			throw new Error(
				"Sign out of the current account before using preview login.",
			);
		}

		const { user } = await signInAnonymously(auth);
		const userRef = doc(firestore, "users", user.uid);
		if (!(await getDoc(userRef)).exists()) {
			await setDoc(userRef, {
				id: user.uid,
				email: "preview@example.com",
				firstName: "Preview",
				lastName: "Participant",
				username: "preview",
				role: "participant",
				phone: "",
				shirtSize: "",
				dietaryRestrictions: "",
				rfidUUID: "",
				attendedEvents: [],
				checklistItemStatuses: [],
			});
		}
	},

	setEmulatorRole: async (role: "organizer" | "participant") => {
		const emulator = auth.emulatorConfig;
		const user = auth.currentUser;
		const projectId = auth.app.options.projectId;
		if (
			!import.meta.env.DEV ||
			emulator?.protocol !== "http" ||
			emulator.host !== "localhost" ||
			emulator.port !== 9099 ||
			!user ||
			!projectId
		) {
			throw new Error(
				"Role switching requires a signed-in local emulator user.",
			);
		}

		const baseUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`;
		const request = async (endpoint: string, data: object) => {
			const response = await fetch(`${baseUrl}/accounts:${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer owner",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error(
					`Auth emulator ${endpoint} failed (${response.status}).`,
				);
			}
			return response.json();
		};

		const lookup = z
			.object({
				users: z
					.array(z.object({ customAttributes: z.string().optional() }))
					.length(1),
			})
			.parse(await request("lookup", { localId: [user.uid] }));
		const existingClaims = lookup.users[0].customAttributes
			? z
					.record(z.string(), z.unknown())
					.parse(JSON.parse(lookup.users[0].customAttributes))
			: {};
		await request("update", {
			localId: user.uid,
			customAttributes: JSON.stringify({
				...existingClaims,
				isOrganizer: role === "organizer",
			}),
		});
		await user.getIdToken(true);
	},

	logout: async () => auth.signOut(),

	isAuthenticated: () => auth.currentUser !== null,

	getCurrentUser: () => auth.currentUser,
};
