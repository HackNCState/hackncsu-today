import { countdownMessageAtom, countdownStringAtom } from "@/atoms/event/countdown";
import { hackingStateAtom } from "@/atoms/event/state";
import { useAtomValue } from "jotai";
import { use, useEffect, useState } from "react";

export default function Countdown() {
	const hackingState = useAtomValue(hackingStateAtom);
	const countdownFormatted = useAtomValue(countdownStringAtom);
	const countdownMessage = useAtomValue(countdownMessageAtom);

	return (
		<div className="flex flex-col w-1/2 sm:w-full sm:items-center sm:text-center justify-center min-h-16">
			<span className="font-bold tracking-wider">{countdownMessage}</span>
			{hackingState === "started" && (
				<span className="text-4xl font-synemono">{countdownFormatted}</span>
			)}
		</div>
	);
}
