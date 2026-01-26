import z from "zod";

export const ChecklistItemSchema = z.object({
    id: z.string(),
    description: z.string(),
    autoChecked: z.boolean().optional(), // whether this item is auto checked by the system
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;