/**
 * Event configuration types (things like schedules, announcements, resources, etc.)
 */

import { z } from "zod";

export const ScheduleItemSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	time: z.string(),
	oldTime: z.string().optional(),
	state: z.enum(["upcoming", "ongoing", "ended"]),
});

export const ScheduleSchema = z.object({
	title: z.string(),
	items: z.array(ScheduleItemSchema),
});

export const AnnouncementSchema = z.object({
	content: z.string(),
	timestamp: z.iso.datetime(),
});

export const BaseResourceSchema = z.object({
	label: z.string(),
	hidden: z.boolean().default(false),
});

export const LinkResourceSchema = BaseResourceSchema.extend({
	type: z.literal("link"),
	url: z.url(),
});

export const TextResourceSchema = BaseResourceSchema.extend({
	type: z.literal("text"),
	content: z.string(),
});

export const ResourceSchema = z.discriminatedUnion("type", [
	LinkResourceSchema,
	TextResourceSchema,
]);

export const TrackSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	fullDescription: z.string().optional(),
	allowedUniversities: z.array(z.string()).default([]),
});

export const ChallengeCategorySchema = z.enum(["default", "mlh"]);

export const ChallengeSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	fullDescription: z.string().optional(),
	category: ChallengeCategorySchema.default("default"),
});

export type ChallengeCategory = z.infer<typeof ChallengeCategorySchema>;

export const ChecklistItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	autoCheck: z.boolean().optional(), // whether this item is auto checked by the system
});

export const ActivitySchema = z.object({
	name: z.string(),
	eligibleForRaffle: z.boolean().default(false),
});

export const EventConfigSchema = z.object({
	tracks: z.array(TrackSchema).default([]),
	challenges: z.array(ChallengeSchema).default([]),
	hackingState: z.enum(["setup", "countdown", "judging", "ended"]),
	hackingEndTime: z.iso.datetime(),
	schedules: z.array(ScheduleSchema).default([]),
	announcements: z.array(AnnouncementSchema).default([]),
	resources: z.array(ResourceSchema).default([]),
	checklistItems: z.array(ChecklistItemSchema).default([]),
	activities: z.array(ActivitySchema).default([]),
	webhookURL: z.url().optional(),
});

export type Track = z.infer<typeof TrackSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type EventConfig = z.infer<typeof EventConfigSchema>;
