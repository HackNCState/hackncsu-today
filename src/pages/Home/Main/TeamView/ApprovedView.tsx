import { firestoreService } from "@/services/firestore.service";
import type { Team } from "@/types/team";
import type { UserData } from "@/types/user";
import { useEffect, useState } from "react";

interface ApprovedViewProps {
	team: Team;
}

// lowkey kinda vibecoded this one but it's okay it looks decent
export default function ApprovedView({ team }: ApprovedViewProps) {
	const [members, setMembers] = useState<UserData[]>([]);

	useEffect(() => {
		const fetchMembers = async () => {
			const memberPromises = team.memberIds.map((id) =>
				firestoreService.fetchUser(id),
			);
			const fetchedMembers = await Promise.all(memberPromises);
			setMembers(fetchedMembers.filter((m): m is UserData => m !== null));
		};
		fetchMembers();
	}, [team.memberIds]);

	return (
		<div className="w-full flex py-2">
			<div className="relative w-full max-w-xl group drop-shadow-xl">
				{/* Ticket Container */}
				<div
					className="relative bg-[#fdfbf7] dark:bg-[#1c1c1c] text-stone-900 dark:text-stone-100 border-x-2 border-stone-900/10 dark:border-stone-100/10"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
						maskImage:
							"radial-gradient(circle at top left, transparent 16px, black 17px), radial-gradient(circle at top right, transparent 16px, black 17px), radial-gradient(circle at bottom left, transparent 16px, black 17px), radial-gradient(circle at bottom right, transparent 16px, black 17px)",
						maskPosition: "top left, top right, bottom left, bottom right",
						maskSize: "51% 51%",
						maskRepeat: "no-repeat",
						WebkitMaskImage:
							"radial-gradient(circle at top left, transparent 16px, black 17px), radial-gradient(circle at top right, transparent 16px, black 17px), radial-gradient(circle at bottom left, transparent 16px, black 17px), radial-gradient(circle at bottom right, transparent 16px, black 17px)",
						WebkitMaskPosition:
							"top left, top right, bottom left, bottom right",
						WebkitMaskSize: "51% 51%",
						WebkitMaskRepeat: "no-repeat",
					}}
				>
					{/* Decorative "Jagged" / Perforated Sides */}
					<div className="absolute left-0 top-0 bottom-0 w-1 bg-repeat-y border-r-2 border-dashed border-stone-300 dark:border-stone-700" />
					<div className="absolute right-0 top-0 bottom-0 w-1 bg-repeat-y border-l-2 border-dashed border-stone-300 dark:border-stone-700" />

					<div className="p-4 sm:p-6 flex flex-col gap-3 mx-2">
						{/* Top Section: Team Name and Track */}
						<div className="flex flex-col gap-1">
							<h2 className="font-playfair text-3xl sm:text-4xl font-black tracking-tightest uppercase break-words leading-none">
								{team.name}
							</h2>
							<p className="text-base sm:text-lg text-muted-foreground uppercase tracking-[0.2em] font-synemono leading-snug">
								STARRING: {team.track} &bull; {team.challenges.join(", ")}
							</p>
						</div>

						{/* Divider */}
						<div className="w-full h-px border-t-2 border-dashed border-stone-300 dark:border-stone-700" />

						{/* Middle Section: Members */}
						<div className="flex flex-col gap-1 items-end text-right relative">
							{/* Status Stamp */}
							<div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-12 border-[4px] border-green-600/40 text-green-600/60 px-4 py-1 font-black text-2xl uppercase tracking-widest mix-blend-multiply dark:mix-blend-screen select-none z-10 pointer-events-none opacity-70">
								{team.status}
							</div>

							<p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0 font-synemono">
								Admit{" "}
								{{
									1: "One",
									2: "Two",
									3: "Three",
									4: "Four",
								}[team.memberIds.length] || team.memberIds.length}
							</p>
							<div className="text-base sm:text-lg leading-tight font-synemono">
								{members.map((member, index) => (
									<span key={member.id}>
										{member.role === "participant"
											? `${member.firstName} ${member.lastName}`
											: member.username}
										{member.id === team.creatorId && (
											<span className="ml-1 text-[10px] border border-current px-1 rounded-full opacity-50 font-sans align-top">
												LEADER
											</span>
										)}
										{index < members.length - 1 && ", "}
									</span>
								))}
							</div>
						</div>

						{/* Divider */}
						<div className="w-full h-px border-t-2 border-dashed border-stone-300 dark:border-stone-700" />

						{/* Bottom Section: Status & "Barcode" */}
						<div className="flex justify-between items-end">
							<div className="flex flex-col relative">
								<p className="text-sm sm:text-base font-bold uppercase tracking-wider font-synemono text-muted-foreground/90">
									FEBRUARY 14TH
								</p>
								<p className="text-[10px] text-muted-foreground opacity-40 font-synemono">
									ID: {team.id}
								</p>
							</div>
							<div className="flex items-end gap-2">
								<span className="text-4xl font-sans font-bold text-muted-foreground/15 leading-none select-none">
									{team.id.slice(0, 4).toUpperCase()}
								</span>
								{/* Fake Barcode */}
								<div className="h-8 flex gap-[2px] opacity-50 items-end">
									{[...Array(15)].map((_, i) => (
										<div
											key={i}
											className="bg-current"
											style={{
												width: Math.random() > 0.5 ? "2px" : "4px",
												height: "100%",
											}}
										/>
									))}
								</div>
							</div>
						</div>

						<p className="text-xs text-muted-foreground">
							Hack_NCState &copy; 2025 &nbsp;|&nbsp;{" "}
							<span className="italic">
								Care for a different track? Let a staff member know.
							</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
