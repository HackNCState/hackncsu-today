import z from "zod";

export const TeamSchema = z.object({
	id: z.string(),
	name: z.string(),
	track: z.string(),
	// for now we allow one challenge per team but this may change in the future
	// hence an array. just more flexible that way
	challenges: z.array(z.string()).default([]),
	creatorId: z.string(),
	mentoringHelp: z.string(),
	memberIds: z.array(z.string()),
	status: z.enum(["unverified", "approved", "rejected"]),
});

export type Team = z.infer<typeof TeamSchema>;
