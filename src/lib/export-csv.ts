import type { Team } from "@/types/team";
import type { UserData } from "@/types/user";
import { firestoreService } from "@/services/firestore.service";

function escapeCsvField(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function toCsvRow(fields: string[]): string {
	return fields.map(escapeCsvField).join(",");
}

export async function exportTeamsCsv(teams: Team[]): Promise<void> {
	const allMemberIds = [...new Set(teams.flatMap((t) => t.memberIds))];
	const memberMap = new Map<string, UserData>();

	const users = await Promise.all(
		allMemberIds.map((id) => firestoreService.fetchUser(id)),
	);
	for (const user of users) {
		if (user) memberMap.set(user.id, user);
	}

	const header = toCsvRow([
		"Team Name",
		"Track",
		"Challenges",
		"Members",
		"Member Emails",
		"Mentoring Help",
		"Status",
	]);

	const rows = teams.map((team) => {
		const members = team.memberIds
			.map((id) => memberMap.get(id))
			.filter((m): m is UserData => m !== undefined);

		const memberNames = members
			.map((m) => {
				const name =
					m.role === "participant"
						? `${m.firstName} ${m.lastName}`
						: m.username;
				return m.id === team.creatorId ? `${name} (creator)` : name;
			})
			.join("; ");

		const memberEmails = members
			.map((m) => ("email" in m && m.email ? m.email : m.username))
			.join("; ");

		return toCsvRow([
			team.name,
			team.track,
			team.challenges.join("; "),
			memberNames,
			memberEmails,
			team.mentoringHelp,
			team.status,
		]);
	});

	const csv = [header, ...rows].join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = `teams-${new Date().toISOString().slice(0, 10)}.csv`;
	link.click();

	URL.revokeObjectURL(url);
}
