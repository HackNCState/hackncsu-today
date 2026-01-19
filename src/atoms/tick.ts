import { atom } from "jotai";

export const tickAtom = atom(new Date());

tickAtom.onMount = (set) => {
    const interval = setInterval(() => set(new Date()), 1000);
    return () => clearInterval(interval);
};
