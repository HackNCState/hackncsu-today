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
import { teamAtom } from "@/atoms/team";
import { useAtomValue } from "jotai";
import UnapprovedView from "./UnapprovedView";

export default function TeamView() {
	const team = useAtomValue(teamAtom);

	function buildView() {
		if (team) {
			if (team.status === "unverified") {
				return <UnapprovedView />;
			} else {
				return <p>Unimplemented</p>
			}
		} else {
			return <UnregisteredView />;
		}
	}

	return (
		<FeedItem
			title="Your Team"
			description={!team ? "You'll need a team to help you during Hack_NCState! Once you have one, please fill out the team formation form below. Only one member of the team needs to complete this form." : null}
		>
			{buildView()}
		</FeedItem>
	);
}
