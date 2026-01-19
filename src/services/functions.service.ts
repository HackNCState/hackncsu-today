import { httpsCallable } from "firebase/functions";
import { functions as fn } from "@/lib/firebase-config";
import z from "zod";
import { PartialParticipantSchema } from "@/types/user";

const functions = {
	searchUsers: "search_users",
	registerTeam: "submit_team_registration",
	loadSchedule: "load_schedule", // this one is organizer only
};

const SearchUsersResponseSchema = z.array(PartialParticipantSchema);

export const functionsService = {
	searchUsers: async (query: string) => {
		const func = httpsCallable(fn, functions.searchUsers);

		const result = await func({ query });
		return SearchUsersResponseSchema.parse(result.data);
	},
	registerTeam: async (teamData: {
		name: string;
		track: string;
		mentoringHelp: string;
		members: string[];
	}) => {
		const func = httpsCallable(fn, functions.registerTeam);
		await func(teamData);
	},
	loadSchedule: async () => {
		const func = httpsCallable(fn, functions.loadSchedule);
		await func();
	}
};
