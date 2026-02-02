import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useId, useState } from "react";
import {
	notificationSettingsAtom,
	setNotificationSettingsAtom,
} from "@/atoms/notifications";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export interface NotificationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function NotificationDialog({
	open,
	onOpenChange,
}: NotificationDialogProps) {
	const notificationSettings = useAtomValue(notificationSettingsAtom);
	const setNotificationSettings = useSetAtom(setNotificationSettingsAtom);

	const [showDeniedAlert, setShowDeniedAlert] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: should call when dialog opens
	useEffect(() => {
		console.log("Notification permission:", Notification.permission);
		if (Notification.permission === "denied") {
			setShowDeniedAlert(true);
		} else {
			setShowDeniedAlert(false);
		}
	}, [open]);

	const baseId = useId();
	const enableNotificationsId = `${baseId}-enable-notifications`;
	const notifyAnnouncementsId = `${baseId}-notify-announcements`;
	const notifyTimerId = `${baseId}-notify-timer`;
	const notifyScheduleId = `${baseId}-notify-schedule`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>Notification Settings</DialogTitle>
					<DialogDescription>
						Turn on notifications to stay updated, even when you're busy coding.
						<br />
						You must leave this tab open to receive notifications.
					</DialogDescription>
				</DialogHeader>

				{showDeniedAlert && (
					<p className="text-destructive text-sm">
						Your browser is blocking notifications for this site. Please enable
						notifications in your browser settings and refresh the page to
						receive notifications.
					</p>
				)}

				<Field orientation="horizontal">
					<Checkbox
						id={enableNotificationsId}
						checked={notificationSettings.enableNotifications}
						onCheckedChange={(checked) =>
							setNotificationSettings({
								enableNotifications: checked as boolean,
							})
						}
					/>
					<FieldContent className="gap-0.5">
						<FieldLabel htmlFor={enableNotificationsId}>
							Enable Notifications
						</FieldLabel>
						<FieldDescription>
							Enable or disable all notifications. Please allow browser
							permissions if prompted.
						</FieldDescription>
					</FieldContent>
				</Field>

				<Separator />

				<Field orientation="horizontal">
					<Checkbox
						id={notifyAnnouncementsId}
						checked={notificationSettings.notifyOnAnnouncement}
						disabled={!notificationSettings.enableNotifications}
						onCheckedChange={(checked) =>
							setNotificationSettings({
								notifyOnAnnouncement: checked as boolean,
							})
						}
					/>
					<FieldContent className="gap-0.5">
						<FieldLabel htmlFor={notifyAnnouncementsId}>
							Announcements
						</FieldLabel>
						<FieldDescription>
							Get notified when new announcements drop.
						</FieldDescription>
					</FieldContent>
				</Field>

				<Field orientation="horizontal">
					<Checkbox
						id={notifyTimerId}
						checked={notificationSettings.notifyOnTimerState}
						disabled={!notificationSettings.enableNotifications}
						onCheckedChange={(checked) =>
							setNotificationSettings({
								notifyOnTimerState: checked as boolean,
							})
						}
					/>
					<FieldContent className="gap-0.5">
						<FieldLabel htmlFor={notifyTimerId}>Timer reminders</FieldLabel>
						<FieldDescription>
							Get timer reminders halfway through and close to submission.
						</FieldDescription>
					</FieldContent>
				</Field>

				<Field orientation="horizontal">
					<Checkbox
						id={notifyScheduleId}
						checked={notificationSettings.notifyOnScheduleChange}
						disabled={!notificationSettings.enableNotifications}
						onCheckedChange={(checked) =>
							setNotificationSettings({
								notifyOnScheduleChange: checked as boolean,
							})
						}
					/>
					<FieldContent className="gap-0.5">
						<FieldLabel htmlFor={notifyScheduleId}>
							Schedule
						</FieldLabel>
						<FieldDescription>
							Get notified when activities are starting.
						</FieldDescription>
					</FieldContent>
				</Field>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
