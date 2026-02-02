import { Button } from "@/components/ui/button";
import {
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from "@/components/ui/table";
import { firestoreService } from "@/services/firestore.service";
import type { Participant, UserData } from "@/types/user";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function ParticipantManager() {
	const navigate = useNavigate();

	const [users, setUsers] = useState<UserData[]>([]);

	const fetchUsers = useCallback(async () => {
		const users = await firestoreService.fetchAllUsers();
		setUsers(users);
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	function rowBuilder(user: Participant) {
		const resumeURL = user.resumeURL;

		return (
			<TableRow key={user.id}>
				<TableCell>{user.username}</TableCell>
				<TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
				<TableCell>{user.email}</TableCell>
				<TableCell>{user.shirtSize}</TableCell>
				<TableCell>{user.dietaryRestrictions || "None"}</TableCell>
				<TableCell>{user.attendedEvents.join(", ") || "None"}</TableCell>
				<TableCell className="justify-end flex">
					{resumeURL && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => window.open(resumeURL, "_blank", "noopener")}
						>
							View Resume
						</Button>
					)}
				</TableCell>
			</TableRow>
		);
	}

	return (
		<div className="p-8 flex flex-col gap-4">
			<header className="flex flex-row items-center gap-2">
				<h1 className="font-playfair font-semibold text-xl sm:text-3xl">
					Participant Manager
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
				<Button variant="outline" onClick={() => fetchUsers()}>
					<p>refresh table</p>
				</Button>
			</header>

			<main>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Username</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Shirt Size</TableHead>
							<TableHead>Dietary Restrictions</TableHead>
							<TableHead>Events Attended</TableHead>
							<TableHead className="w-0">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{[...users]
							.filter((user) => user.role === "participant")
							.sort((a, b) => a.username.localeCompare(b.username))
							.map((user) => rowBuilder(user))}
					</TableBody>
				</Table>
			</main>
		</div>
	);
}
