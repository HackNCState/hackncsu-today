import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { useState } from "react";
import FeedItem from "../FeedItem";
import HackingDatesPicker from "./HackingDatesPicker";
import { Label } from "@/components/ui/label";
import { useAtomValue, useSetAtom } from "jotai";
import { eventConfigAtom, updateEventConfigAtom } from "@/atoms/event/config";
import { useBreakpoint } from "@/hooks/useMediaQuery";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import ResourceEditor from "./ResourceEditor";
import { TrackEditor } from "./TrackEditor";
import { ChallengeEditor } from "./ChallengeEditor";
import { useNavigate } from "react-router-dom";
import { functionsService } from "@/services/functions.service";

export default function OrganizerView() {
	const navigate = useNavigate();

	const config = useAtomValue(eventConfigAtom);
	const updateConfig = useSetAtom(updateEventConfigAtom);

	const isDesktop = useBreakpoint("lg");

	const [announcementText, setAnnouncementText] = useState("");
	const [isInitializing, setIsInitializing] = useState(false);
	const [initializeError, setInitializeError] = useState<string | null>(null);

	const handleInitializeEvent = async () => {
		setIsInitializing(true);
		setInitializeError(null);
		try {
			await functionsService.initializeEvent();
		} catch (error) {
			console.error(error);
			setInitializeError("Failed to initialize event data.");
		} finally {
			setIsInitializing(false);
		}
	};

	const handlePostAnnouncement = (e: React.FormEvent) => {
		// should also handle sending to discord webhook

		e.preventDefault();
		if (!config || !announcementText.trim()) return;

		const newAnnouncement = {
			content: announcementText,
			timestamp: new Date().toISOString(),
		};

		updateConfig({
			announcements: [newAnnouncement, ...config.announcements],
		});
		setAnnouncementText("");
	};

	if (config === null) {
		return (
			<FeedItem title="Organizer Settings">
				<div className="flex flex-col gap-4">
					<p className="text-lg font-synemono">Event data is uninitialized!</p>
					<Button
						onClick={handleInitializeEvent}
						disabled={isInitializing}
						className="w-fit"
					>
						Create data
					</Button>
					{initializeError && (
						<p className="text-sm text-destructive">{initializeError}</p>
					)}
				</div>
			</FeedItem>
		);
	}

	if (!config) return null;

	return (
		<FeedItem title="Organizer Settings">
			<div className="flex flex-col gap-4">
				<h4 className="text-xl font-synemono">Announcements</h4>

				<form onSubmit={handlePostAnnouncement}>
					<ButtonGroup className="w-full">
						<Input
							placeholder="Post an announcement"
							className="flex-1"
							value={announcementText}
							onChange={(e) => setAnnouncementText(e.target.value)}
						/>
						<Button type="submit" variant="outline" aria-label="Post">
							<SendIcon />
						</Button>
					</ButtonGroup>

					<p className="text-sm text-muted-foreground mt-2">
						Press ENTER to submit an announcement. Announcements will also be
						sent in the Discord server.
					</p>
				</form>

				<h4 className="text-xl font-synemono">Management</h4>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline" onClick={() => navigate("/admin/rfid")}>
						RFID Card Scanner
					</Button>
					<Button
						variant="outline"
						onClick={() => navigate("/admin/participants")}
					>
						Manage Participants
					</Button>
					<Button variant="outline" onClick={() => navigate("/admin/teams")}>
						Manage Teams
					</Button>
					<Button variant="outline" onClick={() => navigate("/admin/teams")}>
						Draw Raffle Winners
					</Button>
				</div>

				<h4 className="text-xl font-synemono">
					Configuration (saved automatically)
				</h4>

				<HackingDatesPicker
					endDate={
						config.hackingEndTime ? new Date(config.hackingEndTime) : undefined
					}
					onEndDateChange={(date) =>
						updateConfig({
							hackingEndTime: date?.toISOString(),
						})
					}
				/>

				<div className="flex flex-wrap gap-2">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Edit tracks</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[80vh] flex flex-col">
							<DialogHeader>
								<DialogTitle>Configure Tracks</DialogTitle>
							</DialogHeader>

							<TrackEditor />
						</DialogContent>
					</Dialog>

					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Edit challenges</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[80vh] flex flex-col">
							<DialogHeader>
								<DialogTitle>Configure Challenges</DialogTitle>
							</DialogHeader>

							<ChallengeEditor />
						</DialogContent>
					</Dialog>

					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Edit resources</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[80vh] flex flex-col">
							<DialogHeader>
								<DialogTitle>Configure Resources</DialogTitle>
							</DialogHeader>

							<ResourceEditor />
						</DialogContent>
					</Dialog>

					<Button variant="destructive" onClick={() => updateConfig(null)}>
						Reset event data
					</Button>
				</div>

				<Label>Hacking State</Label>

				<ButtonGroup orientation={isDesktop ? "horizontal" : "vertical"}>
					<Button
						variant={config.hackingState === "setup" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "setup" })}
					>
						Starting soon
					</Button>
					<Button
						variant={
							config.hackingState === "countdown" ? "default" : "outline"
						}
						onClick={() => updateConfig({ hackingState: "countdown" })}
					>
						Countdown
					</Button>
					<Button
						variant={config.hackingState === "judging" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "judging" })}
					>
						Judging
					</Button>
					<Button
						variant={config.hackingState === "ended" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "ended" })}
					>
						Ended
					</Button>
				</ButtonGroup>

				<p className="text-sm text-muted-foreground">
					Starting soon: tells participants that hacking will start soon.
					<br />
					Countdown: counts down to the start of hacking or to the end of
					hacking, depending on the current time.
					<br />
					Judging: indicates that hacking has ended and judging is in progress.
					<br />
					Ended: thanks participants for joining
				</p>
			</div>
		</FeedItem>
	);
}
