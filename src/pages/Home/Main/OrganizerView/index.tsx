import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { EventConfigSchema } from "@/types/event";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { functionsService } from "@/services/functions.service";

export default function OrganizerView() {
	const navigate = useNavigate();

	const config = useAtomValue(eventConfigAtom);
	const updateConfig = useSetAtom(updateEventConfigAtom);

	const isDesktop = useBreakpoint("lg");

	const [announcementText, setAnnouncementText] = useState("");

	useEffect(() => {
		if (config === null) {
			// set config if none exists
			const startTime = new Date();
			startTime.setHours(11, 0, 0);
			const endTime = new Date(startTime);
			endTime.setDate(startTime.getDate() + 1);

			const defaultConfig = EventConfigSchema.parse({
				tracks: [
					{ name: "Track 1", description: "Sample elite ball track" },
					{ name: "Track 2", description: "Sample great ball track" },
					{ name: "Track 3", description: "Sample poke ball track" },
				],
				hackingState: "setup",
				hackingEndTime: endTime.toISOString(),
				resources: [
					{
						type: "text",
						label: "Rules",
						content: `- Rule 1
- Rule 2
- Rule 3
- etc.
						`,
						hidden: false,
					},
					{
						type: "text",
						label: "Tracks",
						content:
							"The Tracks resource is auto-generated based on the tracks you configure for the event.",
						hidden: true,
					},
					{
						type: "text",
						label: "FAQs",
						content:
							"Event FAQs go here. You can use markdown to bold, italicize, and add links and even images!",
						hidden: false,
					},
					{
						type: "text",
						label: "Judging Criteria",
						content:
							"Judging criteria go here. You can use markdown to bold, italicize, and add links and even images!",
						hidden: false,
					},
					{
						type: "text",
						label: "Prizes",
						content:
							"Prizes information goes here. You can use markdown to bold, italicize, and add links and even images!",
						hidden: false,
					},
					{
						type: "text",
						label: "Catering Menu",
						content:
							"![borzoi](https://media1.tenor.com/m/J3sih0hnKLwAAAAC/borzoi-siren.gif	)",
						hidden: false,
					},
					{
						type: "link",
						label: "Opening Slides",
						url: "https://example.com",
						hidden: true,
					},
					{
						type: "link",
						label: "Discord",
						url: "https://example.com",
						hidden: false,
					},
				],
			});

			updateConfig(defaultConfig);

			console.log("No event config found, initializing default config");
		}
	}, [config, updateConfig]);

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
					<Button variant="outline">Manage Participants</Button>
					<Button variant="outline" onClick={() => navigate("/admin/teams")}>
						Manage Teams
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
