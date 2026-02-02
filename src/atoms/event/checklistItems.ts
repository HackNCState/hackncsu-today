import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const checklistItemsAtom = atom((get) => {
    const event = get(eventConfigAtom);
    return event?.checklistItems || [];
})