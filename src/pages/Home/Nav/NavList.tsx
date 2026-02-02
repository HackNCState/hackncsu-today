import { useAtomValue, useSetAtom } from "jotai";
import NavSection from "./NavSection";
import {
	visibleLinkResourcesAtom,
	visibleTextResourcesAtom,
} from "@/atoms/event/resources";
import { authService } from "@/services/auth.service";
import { debugSwitchUserRoleAtom, userAtom } from "@/atoms/user";
import { firestoreService } from "@/services/firestore.service";
import NotificationDialog from "./NotificationDialog";
import { useState } from "react";

export default function NavList() {
	const textResources = useAtomValue(visibleTextResourcesAtom);
	const linkResources = useAtomValue(visibleLinkResourcesAtom);

	const user = useAtomValue(userAtom);
	const debugSwitchRole = useSetAtom(debugSwitchUserRoleAtom);

	const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

	const systemItems = [
		...(import.meta.env.DEV && user?.role !== "organizer"
			? [
					{
						label: "(dev) View as Organizer",
						onClick: () => debugSwitchRole("organizer"),
					},
				]
			: []),
		...(import.meta.env.DEV && user?.role !== "participant"
			? [
					{
						label: "(dev) View as Participant",
						onClick: () => debugSwitchRole("participant"),
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

			<NotificationDialog
				open={notificationDialogOpen}
				onOpenChange={setNotificationDialogOpen}
			/>
		</div>
	);
}
