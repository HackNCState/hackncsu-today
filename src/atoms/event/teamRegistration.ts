import { atom } from "jotai";
import { eventConfigAtom } from "./config";

export const teamRegistrationEnabledAtom = atom((get) => {
	const config = get(eventConfigAtom);
	return config?.teamRegistrationEnabled ?? false;
});
