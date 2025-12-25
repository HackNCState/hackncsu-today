import { countdownStringAtom } from "@/atoms/event/countdown";
import { hackingStateAtom } from "@/atoms/event/state";
import { useAtomValue } from "jotai";
import { use, useEffect, useState } from "react";

export default function Countdown() {
	const hackingState = useAtomValue(hackingStateAtom);
	const countdownFormatted = useAtomValue(countdownStringAtom);

	const [message, setMessage] = useState("");

	useEffect(() => {
		switch (hackingState) {
			case "setup":
				setMessage("STARTING SOON! PLEASE STAND BY.");
				break;
			case "started":
				setMessage("TIME REMAINING");
				break;
			case "judging":
				setMessage("JUDGING IS IN PROGRESS");
				break;
			case "ended":
				setMessage("HACKING HAS ENDED");
				break;
		}
	}, [hackingState]);

	return (
		<div className="flex flex-col w-1/2 sm:w-full sm:items-center sm:text-center justify-center min-h-16">
			<span className="font-bold tracking-wider">{message}</span>
			{hackingState === "started" && (
				<span className="text-4xl font-synemono">{countdownFormatted}</span>
			)}
		</div>
	);
}
