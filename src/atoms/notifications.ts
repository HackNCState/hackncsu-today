import type { Announcement, ScheduleItem } from "@/types/event/event";
import { notificationsService } from "@/services/notifications.service";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface NotificationSettings {
	enableNotifications: boolean;
	notifyOnAnnouncement: boolean;
	notifyOnTimerState: boolean;
	notifyOnScheduleChange: boolean;
}

export const notificationSettingsAtom = atomWithStorage<NotificationSettings>(
	"notificationSettings",
	{
		enableNotifications: false,
		notifyOnAnnouncement: true,
		notifyOnTimerState: true,
		notifyOnScheduleChange: false,
	},
);

// initialize based on browser permission
notificationSettingsAtom.onMount = (setAtom) => {
	if (!notificationsService.isPermissionGranted()) {
		setAtom((prev) => ({
			...prev,
			enableNotifications: false,
		}));
		return;
	}

	setAtom((prev) => ({
		...prev,
		enableNotifications: true,
	}));
};

export const setNotificationSettingsAtom = atom(
	null,
	async (get, set, newSettings: Partial<NotificationSettings>) => {
		const currentSettings = get(notificationSettingsAtom);

		const nextSettings: NotificationSettings = {
			...currentSettings,
			...newSettings,
		};

		// this ugly thing basically requests notification permission if enabling notifications
		// if it is refused, it disables notifications in settings
		if (Object.hasOwn(newSettings, "enableNotifications")) {
			if (newSettings.enableNotifications) {
				const permission =
					await notificationsService.requestNotificationPermission();
				nextSettings.enableNotifications = permission === "granted";
			}

			if (!notificationsService.isPermissionGranted()) {
				nextSettings.enableNotifications = false;
			}
		}

		set(notificationSettingsAtom, nextSettings);
	},
);

function truncate(text?: string, max = 140) {
	if (!text) return text;
	return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

export const requestNotificationAtom = atom(
	null,
	(get, _, { title, body }: { title: string; body?: string }) => {
		const settings = get(notificationSettingsAtom);
		if (!settings.enableNotifications) return;
		notificationsService.sendNotification(title, body);
	},
);

export const requestAnnouncementNotificationAtom = atom(
	null,
	(get, set, announcement: Announcement) => {
		const settings = get(notificationSettingsAtom);
		if (!settings.notifyOnAnnouncement) return;

		set(requestNotificationAtom, {
			title: "Announcement",
			body: truncate(announcement.content, 140),
		});
	},
);

export const requestTimerStateNotificationAtom = atom(
	null,
	(get, set, { title, body }: { title: string; body?: string }) => {
		const settings = get(notificationSettingsAtom);
		if (!settings.notifyOnTimerState) return;

		set(requestNotificationAtom, {
			title,
			body,
		});
	},
);

export const requestScheduleChangeNotificationAtom = atom(
	null,
	(get, set, item: ScheduleItem) => {
		const settings = get(notificationSettingsAtom);
		if (!settings.notifyOnScheduleChange) return;

		set(requestNotificationAtom, {
			title: `Happening Now - ${item.title}`,
			body: item.description,
		});
	},
);
