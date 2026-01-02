import { httpsCallable } from "firebase/functions";
import { functions as fn } from "@/lib/firebase-config";
import z from "zod";
import { PartialParticipantSchema } from "@/types/user";

const functions = {
	searchUsers: "search_users",
};

const SearchUsersResponseSchema = z.array(PartialParticipantSchema);

export const functionsService = {
	searchUsers: async (query: string) => {
		const func = httpsCallable(fn, functions.searchUsers);

		const result = await func({ query });
		return SearchUsersResponseSchema.parse(result.data);
	},
};
