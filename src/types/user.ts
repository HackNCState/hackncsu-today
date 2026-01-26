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

export const ChecklistItemStatusSchema = z.object({
	id: z.string(),
	completed: z.boolean(),
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

	teamId: z.string().nullable().optional(),
	attendedEvents: z.array(z.string()),

	resumeURL: z.string().nullable().optional(),
	checklistItemStatuses: z.array(ChecklistItemStatusSchema).default([]), // TODO: complete implementation
});

export const UserSchema = z.discriminatedUnion("role", [
	OrganizerSchema,
	ParticipantSchema,
]);

/** The partial participant is the data of other users that participants can see */
export const PartialParticipantSchema = ParticipantSchema.pick({
	id: true,
	username: true,
});

export type PartialParticipant = z.infer<typeof PartialParticipantSchema>;
export type Organizer = z.infer<typeof OrganizerSchema>;
export type ChecklistItemStatus = z.infer<typeof ChecklistItemStatusSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type UserData = z.infer<typeof UserSchema>;
