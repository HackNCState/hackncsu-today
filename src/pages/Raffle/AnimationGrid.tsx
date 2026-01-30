import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	useTransform,
} from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface RaffleParticipant {
	name: string;
	activitiesAttended: number;
	teamName?: string;
}

interface RaffleAnimationProps {
	participants?: RaffleParticipant[];
	winners?: RaffleParticipant[];
	onEnd: () => void;
}

const SHUFFLE_COUNT = 50; // Number of names to use in background columns

const SlotReel = ({
	candidates,
	winner,
	onComplete,
}: {
	candidates: string[];
	winner: string;
	onComplete: () => void;
}) => {
	const itemHeight = 120;
	const windowHeight = itemHeight * 5;

	const onCompleteRef = useRef(onComplete);
	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	// FIX: Use useState with an initializer function.
	// This runs exactly ONCE when the component mounts.
	// Even if 'candidates' or 'winner' props change mid-spin,
	// this state will NOT update, preventing the flicker.
	const [reel] = useState(() => {
		const pool =
			candidates.length > 0
				? candidates
				: [
						"Turing",
						"Lovelace",
						"Hopper",
						"Hamilton",
						"Borg",
						"Ritchie",
						"Thompson",
						"Knuth",
						"Cerf",
						"Berners-Lee",
					];

		const generateSequence = (length: number) => {
			const result: string[] = [];

			if (pool.length < 2) {
				return Array.from({ length }).map(() => pool[0]);
			}

			// Shuffle pool initially
			let currentPool = [...pool].sort(() => Math.random() - 0.5);

			for (let i = 0; i < length; i++) {
				if (currentPool.length === 0) {
					currentPool = [...pool].sort(() => Math.random() - 0.5);
					if (
						result.length > 0 &&
						currentPool[0] === result[result.length - 1]
					) {
						currentPool.push(currentPool.shift()!);
					}
				}
				const pick = currentPool.pop();
				if (pick) result.push(pick);
			}
			return result;
		};

		const head = generateSequence(60);
		const tail = generateSequence(10);
		return [...head, winner, ...tail];
	});

	const winnerIndex = 60;
	const y = useMotionValue(0);

	useEffect(() => {
		const targetOffset =
			-(winnerIndex * itemHeight) + (windowHeight - itemHeight) / 2;

		const controls = animate(y, targetOffset, {
			duration: 4,
			ease: [0.1, 0.9, 0.2, 1.0],
			onComplete: () => {
				setTimeout(() => {
					onCompleteRef.current?.();
				}, 800);
			},
		});

		return () => controls.stop();
	}, [y, winnerIndex, itemHeight, windowHeight]);

	return (
		<div
			className="relative overflow-hidden border-y-2 border-zinc-800 bg-zinc-950/50 backdrop-blur-sm"
			style={{ height: windowHeight }}
		>
			<div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 h-[120px] border-y border-white/20 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)] pointer-events-none">
				<div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 font-mono text-2xl">
					▶
				</div>
				<div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 font-mono text-2xl">
					◀
				</div>
			</div>

			<motion.div style={{ y }} className="w-full">
				{reel.map((name, i) => (
					<div
						key={i} // Index key is safe here because the list is static after generation
						className="flex items-center justify-center font-playfair font-bold text-white crt-flicker"
						style={{ height: itemHeight }}
					>
						<span className="text-4xl md:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] capitalize">
							{name}
						</span>
					</div>
				))}
			</motion.div>

			<div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
			<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />
		</div>
	);
};

const Counter = ({ value }: { value: number }) => {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest) => Math.round(latest));

	useEffect(() => {
		const controls = animate(count, value, {
			delay: 0.5,
			duration: 2.5,
			ease: [0.25, 1, 0.5, 1], // Custom logarithmic-like ease out
		});
		return controls.stop;
	}, [value]);

	return <motion.span>{rounded}</motion.span>;
};

const ScrollingColumn = ({
	names,
	duration,
	direction = "up",
}: {
	names: string[];
	duration: number;
	direction?: "up" | "down";
}) => {
	// Duplicate for infinite scroll feel
	const duplicated = [...names, ...names, ...names];

	// Adjust start/end based on direction
	// Up: moves from 0 (top) to -33% (upwards)
	// Down: moves from -33% (shifted up) to 0 (downwards)
	const initialY = direction === "down" ? "-33.33%" : "0%";
	const animateY = direction === "down" ? "0%" : "-33.33%";

	return (
		<div className="relative h-full w-full overflow-hidden">
			<motion.div
				initial={{ y: initialY }}
				animate={{ y: animateY }}
				transition={{
					duration,
					repeat: Infinity,
					ease: "linear",
				}}
				className="flex flex-col items-center gap-4 pb-4"
			>
				{duplicated.map((name, i) => (
					<span
						key={i}
						className="whitespace-nowrap font-mono text-sm md:text-xl capitalize"
					>
						{name}
					</span>
				))}
			</motion.div>
			{/* Gradient masks for smooth edges */}
			<div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
		</div>
	);
};

export default function RaffleAnimation({
	participants = [],
	winners = [],
	onEnd,
}: RaffleAnimationProps) {
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [isRolling, setIsRolling] = useState(false);
	const [showHint, setShowHint] = useState(true);
	const [showSummary, setShowSummary] = useState(false);

	// Memoize candidates list to prevent SlotReel regen on every render
	const candidateNames = useMemo(
		() => (participants.length > 0 ? participants.map((p) => p.name) : []),
		[participants],
	);

	// Prepare columns for the animation
	const columns = useMemo(() => {
		const pool =
			candidateNames.length > 0
				? candidateNames
				: [
						"Turing",
						"Lovelace",
						"Hopper",
						"Hamilton",
						"Borg",
						"Ritchie",
						"Thompson",
						"Knuth",
						"Cerf",
						"Berners-Lee",
					];
		const cols = [];
		// Create 5 columns
		for (let i = 0; i < 5; i++) {
			const shuffled = [...pool]
				.sort(() => 0.5 - Math.random())
				.slice(0, SHUFFLE_COUNT);
			cols.push(shuffled);
		}
		return cols;
	}, [participants]);

	useEffect(() => {
		const hintTimeout = setTimeout(() => {
			setShowHint(false);
		}, 4000);
		return () => clearTimeout(hintTimeout);
	}, []);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onEnd();
			}
		};
		document.addEventListener("keydown", handleKeyPress);
		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	}, [onEnd]);

	// Rolling logic
	const handleNext = () => {
		if (isRolling) return;

		if (currentIndex < winners.length - 1) {
			setIsRolling(true);
			// SlotReel component handles the duration and state update
		} else if (!showSummary) {
			setShowSummary(true);
		} else {
			onEnd();
		}
	};

	const currentWinner =
		currentIndex >= 0 && currentIndex < winners.length
			? winners[currentIndex]
			: null;
	const hasStarted = currentIndex >= 0;
	const allWinnersRevealed = currentIndex >= winners.length - 1 && !isRolling;

	return (
		<main className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 font-sans text-zinc-50 selection:bg-white selection:text-black">
			<style>{`
				@keyframes flicker {
					0% { opacity: 0.99; }
					5% { opacity: 0.88; }
					10% { opacity: 0.95; }
					15% { opacity: 0.99; }
					20% { opacity: 0.92; }
					25% { opacity: 0.96; }
					30% { opacity: 0.85; }
					35% { opacity: 0.97; }
					40% { opacity: 0.99; }
					45% { opacity: 0.99; }
					50% { opacity: 0.90; }
					55% { opacity: 0.97; }
					60% { opacity: 0.99; }
					65% { opacity: 1.00; }
					70% { opacity: 0.94; }
					75% { opacity: 0.98; }
					80% { opacity: 0.92; }
					85% { opacity: 0.96; }
					90% { opacity: 0.99; }
					95% { opacity: 1.00; }
					100% { opacity: 0.98; }
				}
				.crt-flicker {
					animation: flicker 0.15s infinite;
				}
				@keyframes scanline-swipe {
					0% { top: -20%; }
					100% { top: 120%; }
				}
				.scanline-bar {
					animation: scanline-swipe 6s linear infinite;
				}
			`}</style>

			{/* Scanlines (Global overlay) */}
			<div className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />

			{/* CRT Screen Container - Curved Bezel */}
			<div className="relative h-full w-full overflow-hidden shadow-[inset_0_0_180px_rgba(0,0,0,1)] md:h-[90vh] md:w-[92vw] md:rounded-[80px] md:border-[24px] md:border-[#111111] md:shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,1)]">
				{/* CRT Effects Layer */}
				<div className="pointer-events-none absolute inset-0 z-50 rounded-[56px] overflow-hidden">
					{/* Heavy Vignette for corners curvature feel */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.7)_100%)] backdrop-blur-[1px]" />
					{/* Screen Reflection / Glare */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-20 pointer-events-none" />
					{/* Scanlines Inner */}
					<div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%] opacity-30 mix-blend-overlay" />
					{/* Thick Rolling Scanline */}
					<div className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent scanline-bar pointer-events-none opacity-20" />
				</div>

				{/* Content Layer with Softness & Bloom */}
				<div className="relative h-full w-full [filter:contrast(1.1)_brightness(1.2)_blur(0.75px)_drop-shadow(0_0_8px_rgba(255,255,255,0.4))] crt-flicker">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-zinc-950 to-zinc-950 opacity-90" />

					<AnimatePresence>
						{showHint && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className="absolute right-0 top-8 left-0 z-[60] text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500"
							>
								Press ESC to return
							</motion.div>
						)}
					</AnimatePresence>

					<div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
						{/* Mode: Rolling Reel */}
						<AnimatePresence>
							{isRolling && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
									transition={{ duration: 0.3 }}
									className="absolute inset-0 flex items-center justify-center z-40 bg-zinc-950/80 backdrop-blur-sm"
								>
									<div className="w-full max-w-4xl relative">
										<div className="text-center mb-8 font-playfair text-2xl text-zinc-400 animate-pulse">
											Rolling...
										</div>
										<SlotReel
											candidates={
												participants.length > 0
													? participants.map((p) => p.name)
													: []
											}
											winner={
												winners[currentIndex + 1]
													? winners[currentIndex + 1].name
													: "Winner"
											}
											onComplete={() => {
												setIsRolling(false);
												setCurrentIndex((prev) => prev + 1);
											}}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Background Atmosphere */}
						<motion.div
							initial={{ opacity: 0.2 }}
							animate={{ opacity: showSummary ? 0 : 0.2 }}
							transition={{ duration: 1 }}
							className="absolute inset-0 flex items-center justify-center gap-8 px-8 overflow-hidden pointer-events-none"
						>
							{columns.map((names, idx) => (
								<div
									key={idx}
									className={cn(
										"h-[120vh] w-full max-w-[250px]",
										idx === 0 || idx === 4 ? "hidden xl:block" : "",
										idx === 1 || idx === 3 ? "hidden md:block" : "",
									)}
								>
									<ScrollingColumn
										names={names}
										duration={20 + (idx % 3) * 5}
										direction={idx % 2 === 0 ? "down" : "up"}
									/>
								</div>
							))}
						</motion.div>

						{/* Mode: Winner Display */}
						<div className="relative z-20 flex flex-col items-center w-full max-w-6xl px-8">
							<AnimatePresence mode="wait">
								{showSummary ? (
									<motion.div
										key="summary"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 1.05 }}
										transition={{ duration: 0.5 }}
										className="flex flex-col items-center w-full"
									>
										<motion.div
											initial={{ y: -20, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ delay: 0.2 }}
											className="mb-24 text-center"
										>
											<span className="block mb-2 font-synemono text-xl tracking-[0.5em] uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
												Hack_NCState 2026
											</span>
											<h2 className="font-playfair text-xl text-zinc-500 tracking-widest uppercase">
												Raffle Winners
											</h2>
										</motion.div>

										<div
											className={cn(
												"grid w-full gap-x-12",
												winners.length > 8
													? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12"
													: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20",
											)}
										>
											{winners.map((winner, idx) => (
												<motion.div
													key={winner.name}
													initial={{
														opacity: 0,
														scale: 0.9,
														filter: "blur(10px)",
													}}
													animate={{
														opacity: 1,
														scale: 1,
														filter: "blur(0px)",
													}}
													transition={{
														delay: 0.3 + idx * 0.15,
														duration: 0.8,
													}}
													className="relative flex items-center justify-center text-center"
												>
													{/* Ambient Glow Background */}
													<div className="absolute inset-0 bg-white/5 blur-[50px] rounded-full transform scale-150" />

													{/* Top and Bottom Light Lines */}
													<div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
													<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

													<span
														className={cn(
															"relative font-playfair text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]",
															winners.length > 8
																? "text-2xl md:text-3xl lg:text-4xl"
																: "text-4xl md:text-5xl lg:text-6xl",
														)}
													>
														{winner.name}
													</span>
												</motion.div>
											))}
										</div>
									</motion.div>
								) : !isRolling && hasStarted && currentWinner ? (
									<motion.div
										key={currentWinner.name}
										initial={{ opacity: 0, scale: 0.5, y: 50 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.9 }}
										transition={{ type: "spring", stiffness: 200, damping: 20 }}
										className="flex flex-col items-center text-center p-12"
									>
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.2 }}
											className="mb-4 font-synemono text-xl tracking-widest text-zinc-400 uppercase"
										>
											WINNER {currentIndex + 1} / {winners.length}
										</motion.div>

										<h1 className="mb-6 font-playfair text-6xl text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] md:text-8xl lg:text-9xl capitalize">
											{currentWinner.name}
										</h1>

										{currentWinner.teamName && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.3 }}
												className="mb-6 font-playfair italic text-xl text-zinc-400 md:text-4xl"
											>
												of team{" "}
												<span className="text-white">
													{currentWinner.teamName}
												</span>
											</motion.div>
										)}

										<motion.div
											initial={{ width: 0 }}
											animate={{ width: "100%" }}
											transition={{ delay: 0.4, duration: 0.5 }}
											className="mt-2 mb-8 h-px bg-gradient-to-r from-transparent via-white to-transparent"
										/>

										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 }}
											className="flex justify-center text-zinc-400"
										>
											<div className="flex flex-col items-center">
												<span className="mb-2 font-synemono text-xl uppercase tracking-widest text-zinc-200">
													Workshops Attended
												</span>
												<span className="font-mono text-5xl font-bold text-white drop-shadow-md md:text-6xl">
													<Counter value={currentWinner.activitiesAttended} />
												</span>
											</div>
										</motion.div>
									</motion.div>
								) : !isRolling && !hasStarted ? (
									<motion.div
										key="intro"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="font-playfair text-6xl text-white md:text-8xl "
									>
										It's <span className="italic">raffle</span> time.
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>

						{/* Controls */}
						<div className="absolute bottom-24 z-30">
							<AnimatePresence>
								{!isRolling && !showSummary && (
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
										transition={{ duration: 0.3 }}
									>
										<Button
											variant="outline"
											size="lg"
											onClick={handleNext}
											className="h-16 rounded-full border-zinc-700 bg-black/80 px-12 text-lg uppercase tracking-widest text-white backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
										>
											{showSummary
												? "Close Raffle"
												: allWinnersRevealed
													? "View Summary"
													: hasStarted
														? "Next Winner"
														: "Let's Roll"}
										</Button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
