/**
 * Event configuration types (things like schedules, announcements, resources, etc.)
 */

import { z } from "zod";

export const ScheduleItemSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	location: z.string().optional(),
	time: z.string(),
});

export const ScheduleSchema = z.object({
	title: z.string(),
	items: z.array(ScheduleItemSchema),
});

export const AnnouncementSchema = z.object({
	title: z.string(),
	content: z.string(),
	timestamp: z.iso.datetime(),
});

export const ResourceSchema = z.object({
	label: z.string(),
	href: z.url(),
});

export const EventConfigSchema = z.object({
	hackingState: z.enum(["setup", "started", "judging", "ended"]),
	hackingStartTime: z.iso.datetime(),
	hackingEndTime: z.iso.datetime(),
	schedules: z.array(ScheduleSchema).default([]),
	announcements: z.array(AnnouncementSchema).default([]),
	resources: z.array(ResourceSchema).default([]),
});

export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type EventConfig = z.infer<typeof EventConfigSchema>;
