import { eventConfigAtom } from "@/atoms/event";
import { firestoreService } from "@/services/firestore.service";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

export function useEventConfigListener() {
	const setEventConfig = useSetAtom(eventConfigAtom);

	useEffect(() => {
		const unsubscribe = firestoreService.onEventConfigChange((data) => {
			setEventConfig(data);
		});

		return () => unsubscribe();
	}, [setEventConfig]);
}
