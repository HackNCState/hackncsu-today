import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { teamIdAtom } from "./user";
import { firestoreService } from "@/services/firestore.service";
import type { Team } from "@/types/team";

export const teamAtom = atom<Team | null>(null);

// TODO: move to hooks folder or use onMount?
export function useTeamListener() {
	const teamId = useAtomValue(teamIdAtom);
	const setTeam = useSetAtom(teamAtom);

	useEffect(() => {		
		if (!teamId) {
			setTeam(null);
			return;
		}

		const unsubscribe = firestoreService.onTeamSnapshot(teamId, (team) => {
			setTeam(team);
		});

		return () => unsubscribe();
	}, [teamId, setTeam]);
}
