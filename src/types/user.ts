/**
 * User types (organizer and participant)
 */

import { z } from "zod";

const BaseUserSchema = z.object({
	id: z.string(),
	username: z.string(),
	attrs: z.array(z.string()).optional(),
});

export const OrganizerSchema = BaseUserSchema.extend({
	role: z.literal("organizer"),
});

export const ParticipantSchema = BaseUserSchema.extend({
	role: z.literal("participant"),

	email: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
	shirtSize: z.string(),
	dietaryRestrictions: z.string(),
	rfidUUID: z.string(),

	teamId: z.string().optional(),
	attendedEvents: z.array(z.string()),
	hadFirstLunch: z.boolean(),
	hadSecondLunch: z.boolean(),
	hadBreakfast: z.boolean(),
	hadDinner: z.boolean(),
});

export const UserSchema = z.discriminatedUnion("role", [
	OrganizerSchema,
	ParticipantSchema,
]);

export type Organizer = z.infer<typeof OrganizerSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type UserData = z.infer<typeof UserSchema>;
