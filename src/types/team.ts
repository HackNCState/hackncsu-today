import z from "zod";

export const TeamSchema = z.object({
    id: z.string(),
    name: z.string(),
    track: z.string(),
    creatorId: z.string(),
    mentoringHelp: z.string(),
    memberIds: z.array(z.string()),
    status: z.enum(["unverified", "approved", "rejected"]),
});

export type Team = z.infer<typeof TeamSchema>;