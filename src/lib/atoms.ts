import { atom } from "jotai";
import type { User as FirebaseUser } from "firebase/auth";
import type { UserData } from "@/types/user";

// undefined = loading, null = not authenticated, UserData = authenticated
export const userAtom = atom<UserData | null | undefined>(undefined);

export const firebaseUserAtom = atom<FirebaseUser | null>(null);
