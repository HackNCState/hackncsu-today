import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firestoreService } from "@/services/firestore.service";
import type { Participant, UserData } from "@/types/user";
import { useAtomValue } from "jotai";
import { eventConfigAtom } from "@/atoms/event/config";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import RaffleAnimation from "./RaffleAnimation";

interface RaffleParticipant {
	name: string;
	activitiesAttended: number;
	teamName?: string;
}

export default function Raffle() {
	const navigate = useNavigate();
	const eventConfig = useAtomValue(eventConfigAtom);

	const [users, setUsers] = useState<UserData[]>([]);
	const [numWinners, setNumWinners] = useState(3);
	const [showAnimation, setShowAnimation] = useState(false);
	const [winners, setWinners] = useState<RaffleParticipant[]>([]);

	useEffect(() => {
		firestoreService.fetchAllUsers().then(setUsers);
	}, []);

	const eligibleActivities = useMemo(() => {
		return (
			eventConfig?.activities
				?.filter((a) => a.eligibleForRaffle)
				.map((a) => a.name) || []
		);
	}, [eventConfig]);

	const participants = useMemo(() => {
		return users
			.filter((u): u is Participant => u.role === "participant")
			.map((p) => {
				const score = p.attendedEvents.filter((e) =>
					eligibleActivities.includes(e),
				).length;
				return {
					...p,
					score,
				};
			});
	}, [users, eligibleActivities]);

	const formattedParticipants = useMemo<RaffleParticipant[]>(() => {
		return participants.map((p) => ({
			name: `${p.firstName} ${p.lastName}`,
			activitiesAttended: p.score,
		}));
	}, [participants]);

	const handleStartRaffle = () => {
		if (numWinners <= 0) return;

		// Create a weighted pool
		const pool: Participant[] = [];
		for (const p of participants) {
			for (let i = 0; i < p.score; i++) {
				pool.push(p);
			}
		}

		if (pool.length === 0) {
			alert("No eligible participants found (score > 0)");
			return;
		}

		const selectedWinners: Participant[] = [];
		let currentPool = [...pool];

		for (let i = 0; i < numWinners; i++) {
			if (currentPool.length === 0) break;

			const randomIndex = Math.floor(Math.random() * currentPool.length);
			const winner = currentPool[randomIndex];
			selectedWinners.push(winner);

			// Remove this winner from the pool completely to avoid duplicate wins
			currentPool = currentPool.filter((p) => p.id !== winner.id);
		}

		const formattedWinners = selectedWinners.map((p) => ({
			name: `${p.firstName} ${p.lastName}`,
			activitiesAttended: p.attendedEvents.filter((e) =>
				eligibleActivities.includes(e),
			).length,
		}));

		setWinners(formattedWinners);
	};

	if (showAnimation) {
		return (
			<RaffleAnimation
				winners={winners}
				participants={formattedParticipants}
				onEnd={() => setShowAnimation(false)}
			/>
		);
	}

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					Raffle Setup
				</h1>
				<Button
					onClick={() => navigate(-1)}
					variant="destructive"
					className="ml-auto"
				>
					go back
				</Button>
			</header>

			<main className="flex flex-col gap-8 max-w-lg">
				<div className="flex flex-col gap-4">
					<p className="text-muted-foreground">
						Select the number of winners. Participants are weighted by their
						eligible activity attendance.
					</p>

					<div className="flex flex-col gap-2">
						<Label htmlFor="numWinners">Number of Winners</Label>
						<Input
							id="numWinners"
							type="number"
							min={1}
							value={numWinners}
							onChange={(e) => setNumWinners(parseInt(e.target.value) || 0)}
						/>
					</div>

					<div className="bg-muted p-4 rounded-lg text-sm space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Participants:</span>
							<span>{participants.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Entries (Weighted):
							</span>
							<span>{participants.reduce((acc, p) => acc + p.score, 0)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">User Data Loaded:</span>
							<span>{users.length > 0 ? "Yes" : "No"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Eligible Activities:
							</span>
							<span>{eligibleActivities.length}</span>
						</div>
					</div>

					<div className="flex flex-row gap-2">
						<Button onClick={handleStartRaffle} disabled={users.length === 0}>
							Calculate Winners
						</Button>

						{winners.length > 0 && (
							<Button
								onClick={() => setShowAnimation(true)}
								variant="secondary"
							>
								Start Raffle Animation
							</Button>
						)}
					</div>
				</div>

				{winners.length > 0 && (
					<div className="flex flex-col gap-2">
						<h2 className="font-semibold text-xl">Selected Winners</h2>
						<div className="bg-muted p-4 rounded-lg space-y-2">
							{winners.map((winner, i) => (
								<div key={i} className="flex justify-between items-center">
									<div className="font-medium">
										{i + 1}. {winner.name}
									</div>
									<div className="text-sm text-muted-foreground">
										{winner.activitiesAttended} activities
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
