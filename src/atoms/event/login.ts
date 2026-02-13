import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const loginEnabledAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.loginEnabled ?? true;
});
