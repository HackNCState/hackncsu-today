import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { firestoreService } from "@/services/firestore.service";
import { rfidService } from "@/services/rfid.service";
import type { Participant } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RFIDReader() {
	const navigate = useNavigate();

	// TODO: add setting event stuff

	const [isReaderConnected, setIsReaderConnected] = useState(false);
	const [rfidData, setRfidData] = useState<string | null>(null);
	const [rfidParticipant, setRfidParticipant] = useState<
		Participant | null | undefined
	>(undefined);
	const [showUnsupportedWarning, setShowUnsupportedWarning] = useState(false);

	const port = useRef<any | null>(null);

	useEffect(() => {
		if (!rfidService.isSupported()) {
			setShowUnsupportedWarning(true);
		}
	}, []);

	async function connect() {
		const p = await rfidService.openPort();
		setIsReaderConnected(true);

		port.current = p;

		try {
			await rfidService.startListening(p, onRFIDScan);
		} catch (error) {
			console.error("Error starting RFID listening:", error);
			setIsReaderConnected(false);
		}
	}

	async function disconnect() {
		await rfidService.closePort(port.current);
		setIsReaderConnected(false);
	}

	async function onRFIDScan(uuid: string) {
		setRfidData(uuid);

		const participant = await firestoreService.fetchUserByRFID(uuid);

		console.log("Fetched participant:", participant);

		if (participant) {
			setRfidParticipant(participant);
		} else {
			setRfidParticipant(null);
		}
	}

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					RFID Reader
				</h1>
				{isReaderConnected && (
					<Button className="ml-auto" onClick={disconnect}>
						Disconnect
					</Button>
				)}
				<Button
					onClick={() => {
						if (isReaderConnected) {
							rfidService.closePort(port.current);
						}
						navigate(-1);
					}}
					variant="destructive"
					className={cn(!isReaderConnected && "ml-auto")}
				>
					go back
				</Button>
			</header>

			<main>
				<div className="h-full flex flex-col justify-center items-center gap-1">
					{!isReaderConnected ? (
						<>
							<p>RFID Scanner is not connected.</p>
							<p>
								Please plug it in and click connect. Then, select the scanner
								from the list.
							</p>
						</>
					) : (
						<>
							<p>RFID Scanner is connected.</p>
							<p>Tap a card on the scanner...</p>
							{rfidData && (
								<>
									<p className="mt-4">Read RFID Data:</p>
									<p className="font-mono text-lg">{rfidData}</p>
								</>
							)}
							{rfidParticipant ? (
								<>
									<p className="mt-4">Participant Info:</p>
									<p>
										Name: {rfidParticipant.firstName} {rfidParticipant.lastName}
									</p>
									<p>Discord Username: {rfidParticipant.username}</p>
									<p>
										Events attended: {rfidParticipant.attendedEvents.join(", ")}
									</p>
								</>
							) : rfidParticipant === null ? (
								<p className="mt-4 text-destructive">
									No participant found for this RFID.
								</p>
							) : null}
						</>
					)}

					{!isReaderConnected &&
						(showUnsupportedWarning ? (
							<p className="text-destructive">
								Your browser does not support the Web Serial API. Please use
								Google Chrome, Opera GX, or Microsoft Edge.
							</p>
						) : (
							<Button className="mt-2" onClick={connect}>
								Connect
							</Button>
						))}
				</div>
			</main>
		</div>
	);
}
