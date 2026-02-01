import { atom } from "jotai";
import { eventConfigAtom } from "./config";
import { firestoreService } from "@/services/firestore.service";

export const webhookURLAtom = atom((get) => {
    const config = get(eventConfigAtom);
    return config?.webhookURL ?? undefined;
});

export const setWebhookURLAtom = atom(null, async (get, _, url:  | undefined) => {
    await firestoreService.updateEventConfig({ webhookURL: url });
});

export const deleteWebhookURLAtom = atom(null, async (get, _) => {
    const webhookURL = get(webhookURLAtom);
    if (!webhookURL) return;

    await firestoreService.updateEventConfig({ webhookURL: undefined });
});