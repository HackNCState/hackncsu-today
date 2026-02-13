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
	university: z.string().optional(),

	teamId: z.string().nullable().optional(),
	attendedEvents: z.array(z.string()).default([]),

	resumeURL: z.string().nullable().optional(),
	checklistItemStatuses: z.array(ChecklistItemStatusSchema).default([]),
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

/** Limited profile data returned by get_team_member_profiles */
export const TeamMemberProfileSchema = z.object({
	id: z.string(),
	username: z.string(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	role: z.enum(["organizer", "participant"]),
});

export type PartialParticipant = z.infer<typeof PartialParticipantSchema>;
export type TeamMemberProfile = z.infer<typeof TeamMemberProfileSchema>;
export type Organizer = z.infer<typeof OrganizerSchema>;
export type ChecklistItemStatus = z.infer<typeof ChecklistItemStatusSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type UserData = z.infer<typeof UserSchema>;
