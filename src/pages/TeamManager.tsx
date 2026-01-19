import { Button } from "@/components/ui/button";
import {
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from "@/components/ui/table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { firestoreService } from "@/services/firestore.service";
import type { Team } from "@/types/team";
import type { UserData } from "@/types/user";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function TeamMembersList({ team }: { team: Team }) {
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
		<span>
			{members.map((member, index) => {
				const isCreator = member.id === team.creatorId;
				const name =
					member.role === "participant"
						? `${member.firstName} ${member.lastName}`
						: member.username;
				return (
					<Tooltip key={member.id}>
						<TooltipTrigger asChild>
							<span>
								{isCreator ? <strong>{name}</strong> : name}
								{index < members.length - 1 ? ", " : ""}
							</span>
						</TooltipTrigger>
						<TooltipContent>
							{member.username}
							{isCreator ? "  (creator)" : ""}
						</TooltipContent>
					</Tooltip>
				);
			})}
		</span>
	);
}

export default function TeamManager() {
	const navigate = useNavigate();

	const [teams, setTeams] = useState<Team[]>([]);

	const fetchTeams = useCallback(async () => {
		const teams = await firestoreService.fetchAllTeams();
		setTeams(teams);
	}, []);

	useEffect(() => {
		fetchTeams();
	}, [fetchTeams]);

	function rowBuilder(team: Team) {
		const isUnverified = team.status === "unverified";
		return (
			<TableRow
				key={team.id}
				className={isUnverified ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
			>
				<TableCell>{team.name}</TableCell>
				<TableCell>{team.track}</TableCell>
				<TableCell>
					<TeamMembersList team={team} />
				</TableCell>
				<TableCell className="whitespace-pre-wrap">
					{team.mentoringHelp}
				</TableCell>
				<TableCell>{team.status}</TableCell>
				<TableCell className="justify-end flex">
					{team.status === "unverified" && (
						<Button
							variant="outline"
							size="sm"
							onClick={async () => {
								await firestoreService.updateTeam(team.id, {
									status: "approved",
								});

								for (const memberId of team.memberIds) {
									await firestoreService.updateUser(memberId, {
										teamId: team.id,
									});
								}

								fetchTeams();
							}}
						>
							Approve
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						className="ml-2"
						onClick={async () => {
							await firestoreService.deleteTeam(team.id);
							fetchTeams();
						}}
					>
						Delete
					</Button>
				</TableCell>
			</TableRow>
		);
	}

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					Team Manager
				</h1>
				<p className="ml-2 text-muted-foreground">
					this page is NOT live updated. use the refresh button on the right.
				</p>
				<Button
					onClick={() => navigate(-1)}
					variant="destructive"
					className="ml-auto"
				>
					<p>go back</p>
				</Button>
				<Button variant="outline" onClick={() => fetchTeams()}>
					<p>refresh table</p>
				</Button>
			</header>

			<main>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Track</TableHead>
							<TableHead>Members</TableHead>
							<TableHead>Mentoring Help</TableHead>
							<TableHead className="w-0">Status</TableHead>
							<TableHead className="w-0">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{[...teams]
							.sort((a, b) => {
								if (a.status === "unverified" && b.status !== "unverified")
									return -1;
								if (a.status !== "unverified" && b.status === "unverified")
									return 1;
								return 0;
							})
							.map((team) => rowBuilder(team))}
					</TableBody>
				</Table>
			</main>
		</div>
	);
}
