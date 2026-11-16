import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import {
	visibleLinkResourcesAtom,
	visibleTextResourcesAtom,
} from "@/atoms/event/resources";
import { debugSwitchUserRoleAtom, userAtom } from "@/atoms/user";
import { authService } from "@/services/auth.service";
import { firestoreService } from "@/services/firestore.service";
import NavSection from "./NavSection";
import NotificationDialog from "./NotificationDialog";

export default function NavList() {
	const textResources = useAtomValue(visibleTextResourcesAtom);
	const linkResources = useAtomValue(visibleLinkResourcesAtom);

	const user = useAtomValue(userAtom);
	const debugSwitchRole = useSetAtom(debugSwitchUserRoleAtom);

	const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
	const [roleError, setRoleError] = useState("");

	const switchRole = async (role: "organizer" | "participant") => {
		setRoleError("");
		try {
			await debugSwitchRole(role);
		} catch (error) {
			console.error("Could not switch preview role:", error);
			setRoleError(
				"Could not switch roles. Check that the emulators are running.",
			);
		}
	};

	const systemItems = [
		...(import.meta.env.DEV && user?.role !== "organizer"
			? [
					{
						label: "(dev) View as Organizer",
						onClick: () => switchRole("organizer"),
					},
				]
			: []),
		...(import.meta.env.DEV && user?.role === "organizer"
			? [
					{
						label: "(dev) Refresh Organizer permissions",
						onClick: () => switchRole("organizer"),
					},
				]
			: []),
		...(import.meta.env.DEV && user?.role !== "participant"
			? [
					{
						label: "(dev) View as Participant",
						onClick: () => switchRole("participant"),
					},
				]
			: []),
		...(import.meta.env.DEV
			? [
					{
						label: "(dev) Create Sample Users",
						onClick: () => firestoreService.debugCreateSampleParticipants(),
					},
				]
			: []),
		{
			label: "Notifications",
			onClick: () => setNotificationDialogOpen(true),
		},
		{
			label: "Log out",
			onClick: () => authService.logout(),
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<NavSection
				title="Resources"
				items={textResources.map((resource) => ({
					type: "resource",
					resource,
				}))}
			/>

			<NavSection
				title="Quick Links"
				items={linkResources.map((resource) => ({
					type: "resource",
					resource,
				}))}
			/>

			<NavSection
				title="System"
				items={systemItems.map((item) => ({ type: "function", ...item }))}
			/>

			{roleError && <p role="alert">{roleError}</p>}

			<NotificationDialog
				open={notificationDialogOpen}
				onOpenChange={setNotificationDialogOpen}
			/>
		</div>
	);
}
