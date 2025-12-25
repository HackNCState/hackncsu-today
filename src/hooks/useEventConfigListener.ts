import { eventConfigAtom } from "@/atoms/event/config";
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
