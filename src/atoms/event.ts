import type { EventConfig } from "@/types/event";
import { atom } from "jotai";

// undefined = loading, null = no config (should create one i reckon), EventConfig = config
export const eventConfigAtom = atom<EventConfig | null | undefined>(undefined);