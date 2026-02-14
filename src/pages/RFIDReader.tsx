import { activitiesAtom } from "@/atoms/event/activities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { firestoreService } from "@/services/firestore.service";
import { rfidService } from "@/services/rfid.service";
import type { Team } from "@/types/team";
import type { Participant } from "@/types/user";
import { useAtomValue } from "jotai";
import { Check, Clipboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RFIDReader() {
	const navigate = useNavigate();

	const [isReaderConnected, setIsReaderConnected] = useState(false);
	const [rfidData, setRfidData] = useState<string | null>(null);
	const [rfidParticipant, setRfidParticipant] = useState<
		Participant | null | undefined
	>(undefined);
	const [team, setTeam] = useState<Team | null>(null);
	const [showUnsupportedWarning, setShowUnsupportedWarning] = useState(false);

	const activities = useAtomValue(activitiesAtom);
	const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
	const selectedActivityRef = useRef(selectedActivity);

	useEffect(() => {
		selectedActivityRef.current = selectedActivity;
	}, [selectedActivity]);

	const [showActivityAssignedToast, setShowActivityAssignedToast] = useState<
		"hidden" | "success" | "alreadyAttended"
	>("hidden");
	const [copied, setCopied] = useState(false);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, []);

	useEffect(() => {
		if (!rfidService.isSupported()) {
			setShowUnsupportedWarning(true);
		}

		if (rfidService.port) {
			setIsReaderConnected(true);
		}
	}, []);

	async function connect() {
		await rfidService.openPort();
		setIsReaderConnected(true);

		try {
			await rfidService.startListening(onRFIDScan, (_) => {
				setIsReaderConnected(false);
			});
		} catch (error) {
			console.error("Error starting RFID listening:", error);
			setIsReaderConnected(false);
		}
	}

	async function disconnect() {
		await rfidService.closePort();
		setIsReaderConnected(false);
	}

	async function onRFIDScan(uuid: string) {
		setShowActivityAssignedToast("hidden");
		setRfidData(uuid);
		setRfidParticipant(undefined);
		setTeam(null);

		const participant = await firestoreService.fetchUserByRFID(uuid);

		if (participant) {
			setRfidParticipant(participant);

			if (selectedActivityRef.current) {
				await rewardAttendance(participant, selectedActivityRef.current);
			}

			if (participant.teamId) {
				const teamData = await firestoreService.fetchTeam(participant.teamId);
				setTeam(teamData);
			} else {
				setTeam(null);
			}
		} else {
			setRfidParticipant(null);
		}
	}

	async function rewardAttendance(user: Participant, activityName: string) {
		const attendance = user.attendedEvents || [];

		if (!attendance.includes(activityName)) {
			attendance.push(activityName);
			setShowActivityAssignedToast("success");
		} else {
			setShowActivityAssignedToast("alreadyAttended");
			return;
		}

		await firestoreService.updateUser(user.id, {
			attendedEvents: attendance,
		});
	}

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					RFID Reader
				</h1>

				<Button
					onClick={() => {
						if (isReaderConnected) {
							rfidService.closePort();
						}
						navigate(-1);
					}}
					variant="destructive"
					className="ml-auto"
				>
					go back
				</Button>
				{isReaderConnected && <Button onClick={disconnect}>Disconnect</Button>}
			</header>

			<main>
				{showActivityAssignedToast !== "hidden" && (
					<div
						className={cn(
							"absolute bottom-0 right-0 m-16 p-12 text-white text-[10rem]",
							showActivityAssignedToast === "success"
								? "bg-green-600"
								: "bg-red-600 ",
							"hover:opacity-25",
						)}
					>
						{showActivityAssignedToast === "success" ? "OK" : "STOP"}
					</div>
				)}

				<div className="flex flex-col">
					{!isReaderConnected ? (
						<>
							<p>RFID Scanner is not connected.</p>
							<p>
								Please plug it in and click connect. Then, select the scanner
								from the list.
							</p>
							<p>
								If the page breaks (especially if you disconnect the reader
								while connected), try refreshing the page to reset the
								connection.
							</p>
						</>
					) : (
						<>
							<p>RFID Scanner is connected.</p>

							<p className="mt-4">
								Choose whether the user should receive attendance for an
								activity when they tap their card.
								<strong> No need to use this for check-in.</strong>
								<br />* means this activity is not eligible for the raffle.
							</p>

							<div className="mt-2 flex flex-wrap gap-2">
								<Button
									variant={!selectedActivity ? "default" : "outline"}
									onClick={() => setSelectedActivity(null)}
								>
									No
								</Button>
								{activities.map((activity) => (
									<Button
										key={activity.name}
										variant={
											selectedActivity === activity.name ? "default" : "outline"
										}
										onClick={() => {
											setShowActivityAssignedToast("hidden");
											setSelectedActivity(activity.name);
										}}
									>
										{activity.name}
										{!activity.eligibleForRaffle && "*"}
									</Button>
								))}
							</div>

							{showActivityAssignedToast === "success" && (
								<p className="mt-2 text-green-500">
									Attendance has been recorded!
								</p>
							)}

							{showActivityAssignedToast === "alreadyAttended" && (
								<p className="mt-2 text-destructive">
									User has already attended this activity.
								</p>
							)}

							<p className="mt-4">Scan a card to see its data.</p>

							{rfidData && (
								<>
									<p className="mt-4">The card has the following ID:</p>
									<button
										type="button"
										className="mt-1 inline-flex items-center gap-2 font-mono text-lg text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
										onClick={() => copyToClipboard(rfidData)}
									>
										<span className="underline decoration-dashed underline-offset-4">
											{rfidData}
										</span>
										{copied ? (
											<>
												<Check className="size-4 text-green-500" />
												<span className="text-sm text-green-500 font-sans">
													Copied to clipboard!
												</span>
											</>
										) : (
											<Clipboard className="size-4" />
										)}
									</button>
								</>
							)}
							{rfidParticipant ? (
								<>
									<p className="mt-4">Participant Info:</p>
									<p className="text-muted-foreground">
										Name: {rfidParticipant.firstName} {rfidParticipant.lastName}
										<br />
										Discord: {rfidParticipant.username}
										<br />
										Email: {rfidParticipant.email || "N/A"}
										<br />
										Phone: {rfidParticipant.phone || "N/A"}
										<br />
										Dietary Restrictions:{" "}
										{rfidParticipant.dietaryRestrictions || "N/A"}
										<br />
										Shirt Size: {rfidParticipant.shirtSize || "N/A"}
										<br />
										Attended Events:{" "}
										{rfidParticipant.attendedEvents.join(", ") || "None"}
									</p>
								</>
							) : rfidParticipant === null ? (
								<p className="mt-4 text-destructive">
									No participant found for this RFID. If this is unexpected,
									please check the database.
								</p>
							) : null}
							{team && (
								<>
									<p className="mt-4">Team Info:</p>
									<p className="text-muted-foreground">
										Name: {team.name}
										<br />
										Track: {team.track}
										<br />
										Challenges: {team.challenges.join(", ") || "N/A"}
										<br />
										ID: {team.id}
									</p>
								</>
							)}
						</>
					)}

					{!isReaderConnected &&
						(showUnsupportedWarning ? (
							<p className="text-destructive">
								Your browser does not support the Web Serial API. Please use
								Google Chrome, Opera GX, or Microsoft Edge.
							</p>
						) : (
							<Button className="mt-2 w-fit" onClick={connect}>
								Connect
							</Button>
						))}
				</div>
			</main>
		</div>
	);
}
