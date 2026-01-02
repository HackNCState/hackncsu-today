import { Button } from "@/components/ui/button";
import FeedItem from "../FeedItem";
import { ArrowRight, BadgePlus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import UnregisteredView from "./UnregisteredView";

export default function TeamView() {
	return (
		<FeedItem
			title="Your Team"
			description="You're not part of a team yet! Once you have a team, please fill out the team formation form below.
            Only one member of the team needs to complete this form."
		>
			<UnregisteredView />
		</FeedItem>
	);
}
