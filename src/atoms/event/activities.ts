import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const activitiesAtom = atom((get) => {
    const event = get(eventConfigAtom);
    return event?.activities || [];
})