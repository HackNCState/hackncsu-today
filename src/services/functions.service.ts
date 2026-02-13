import { httpsCallable } from "firebase/functions";
import { functions as fn } from "@/lib/firebase-config";
import z from "zod";
import {
	PartialParticipantSchema,
	TeamMemberProfileSchema,
} from "@/types/user";

const functions = {
	searchUsers: "search_users",
	registerTeam: "submit_team_registration",
	loadSchedule: "load_schedule", // this one is organizer only
	initializeEvent: "initialize_event", // this one is organizer only
	getTeamMemberProfiles: "get_team_member_profiles",
};

const SearchUsersResponseSchema = z.array(PartialParticipantSchema);
const TeamMemberProfilesResponseSchema = z.array(TeamMemberProfileSchema);

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
		challenges: string[];
	}) => {
		const func = httpsCallable(fn, functions.registerTeam);
		await func(teamData);
	},
	loadSchedule: async () => {
		const func = httpsCallable(fn, functions.loadSchedule);
		await func();
	},
	initializeEvent: async () => {
		const func = httpsCallable(fn, functions.initializeEvent);
		await func();
	},
	getTeamMemberProfiles: async (teamId: string) => {
		const func = httpsCallable(fn, functions.getTeamMemberProfiles);
		const result = await func({ teamId });
		return TeamMemberProfilesResponseSchema.parse(result.data);
	},
};
