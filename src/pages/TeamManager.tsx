import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from "@/components/ui/table";
import TeamForm, { type TeamFormSubmitPayload } from "@/components/TeamForm";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { challengesAtom } from "@/atoms/event/challenges";
import { tracksAtom } from "@/atoms/event/tracks";
import { firestoreService } from "@/services/firestore.service";
import type { Team } from "@/types/team";
import type { PartialParticipant, UserData } from "@/types/user";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";

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
	const tracks = useAtomValue(tracksAtom);
	const challenges = useAtomValue(challengesAtom);

	const [teams, setTeams] = useState<Team[]>([]);
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [editingMembers, setEditingMembers] = useState<PartialParticipant[]>(
		[],
	);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isEditLoading, setIsEditLoading] = useState(false);
	const [editLoadError, setEditLoadError] = useState<string | null>(null);

	const fetchTeams = useCallback(async () => {
		const teams = await firestoreService.fetchAllTeams();
		setTeams(teams);
	}, []);

	useEffect(() => {
		fetchTeams();
	}, [fetchTeams]);

	useEffect(() => {
		const loadMembers = async () => {
			if (!isEditOpen || !editingTeam) return;

			setIsEditLoading(true);
			setEditLoadError(null);
			try {
				const memberPromises = editingTeam.memberIds.map((id) =>
					firestoreService.fetchUser(id),
				);
				const fetchedMembers = await Promise.all(memberPromises);
				const partialMembers = fetchedMembers
					.filter((m): m is UserData => m !== null)
					.map((member) => ({ id: member.id, username: member.username }));
				setEditingMembers(partialMembers);
			} catch (error) {
				console.error("Failed to load team members", error);
				setEditLoadError("Failed to load team members");
			} finally {
				setIsEditLoading(false);
			}
		};

		loadMembers();
	}, [editingTeam, isEditOpen]);

	const handleEditOpenChange = (open: boolean) => {
		setIsEditOpen(open);
		if (!open) {
			setEditingTeam(null);
			setEditingMembers([]);
			setEditLoadError(null);
		}
	};

	const handleUpdateTeam = async (payload: TeamFormSubmitPayload) => {
		if (!editingTeam) return;

		const updatedMemberIds = payload.memberIds;
		const removedMemberIds = editingTeam.memberIds.filter(
			(id) => !updatedMemberIds.includes(id),
		);
		const addedMemberIds = updatedMemberIds.filter(
			(id) => !editingTeam.memberIds.includes(id),
		);

		await firestoreService.updateTeam(editingTeam.id, {
			name: payload.name,
			track: payload.track,
			mentoringHelp: payload.mentoringHelp,
			challenges: payload.challenges,
			memberIds: updatedMemberIds,
		});

		if (editingTeam.status === "approved") {
			for (const memberId of removedMemberIds) {
				await firestoreService.updateUser(memberId, { teamId: null });
			}

			for (const memberId of addedMemberIds) {
				await firestoreService.updateUser(memberId, { teamId: editingTeam.id });
			}
		}

		fetchTeams();
	};

	const handleApproveTeam = async (team: Team) => {
		await firestoreService.updateTeam(team.id, {
			status: "approved",
		});

		for (const memberId of team.memberIds) {
			const member = await firestoreService.fetchUser(memberId);
			if (member?.role !== "participant") continue;

			const existingStatuses = member.checklistItemStatuses || [];
			const filteredStatuses = existingStatuses.filter(
				(status) => status.id !== "create_team" && status.id !== "approve_team",
			);

			const checklistItemStatuses = [
				...filteredStatuses,
				{ id: "create_team", completed: true },
				{ id: "approve_team", completed: true },
			];

			await firestoreService.updateUser(memberId, {
				teamId: team.id,
				checklistItemStatuses,
			});
		}

		fetchTeams();
	};

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
					{team.challenges.length > 0 ? team.challenges.join(", ") : "-"}
				</TableCell>
				<TableCell>
					<TeamMembersList team={team} />
				</TableCell>
				<TableCell className="whitespace-pre-wrap">
					{team.mentoringHelp}
				</TableCell>
				<TableCell>{team.status}</TableCell>
				<TableCell className="justify-end flex">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditingTeam(team);
							setIsEditOpen(true);
						}}
					>
						Edit
					</Button>
					{team.status === "unverified" && (
						<Button
							variant="outline"
							size="sm"
							className="ml-2"
							onClick={() => handleApproveTeam(team)}
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
							<TableHead>Challenge</TableHead>
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

			<Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
				<DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Team</DialogTitle>
						<DialogDescription>
							Update team details and members.
						</DialogDescription>
					</DialogHeader>

					{editLoadError && (
						<div className="text-destructive text-sm">{editLoadError}</div>
					)}

					{isEditLoading && (
						<div className="text-sm text-muted-foreground">
							Loading team members...
						</div>
					)}

					{!isEditLoading && editingTeam && (
						<TeamForm
							tracks={tracks}
							challenges={challenges}
							initialValues={{
								name: editingTeam.name,
								track: editingTeam.track,
								mentoringHelp: editingTeam.mentoringHelp,
								challenges: editingTeam.challenges,
								members: editingMembers,
							}}
							lockedMemberIds={[editingTeam.creatorId]}
							submitLabel="Save Changes"
							onSubmit={handleUpdateTeam}
							onSuccess={() => {
								setIsEditOpen(false);
								setEditingTeam(null);
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
