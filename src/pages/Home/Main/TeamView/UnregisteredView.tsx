import { useAtomValue } from "jotai";
import { tracksAtom } from "@/atoms/event/tracks";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Plus, Search, User } from "lucide-react";

export default function UnregisteredView() {
	const tracks = useAtomValue(tracksAtom);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" className="mt-2 w-full sm:w-auto">
					<ArrowRight className="mr-2 h-4 w-4" /> Register Your Team
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Register Team</DialogTitle>
					<DialogDescription>
						Only one member of your team needs to fill out this form.
					</DialogDescription>
				</DialogHeader>

				<form>
					<FieldGroup className="py-4">
						{/* Team Name */}
						<Field>
							<FieldLabel htmlFor="team-name">Team Name</FieldLabel>
							<Input id="team-name" placeholder="Enter your team name" />
						</Field>

						{/* Track Selection */}
						<Field>
							<FieldLabel htmlFor="track">Track</FieldLabel>
							<Select>
								<SelectTrigger id="track">
									<SelectValue placeholder="Select a track" />
								</SelectTrigger>
								<SelectContent>
									{tracks.map((track) => (
										<SelectItem key={track.name} value={track.name}>
											{track.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						{/* Members Section */}
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel>Members (1/4)</FieldLabel>
								<span className="text-xs text-muted-foreground">
									Min 2 members required
								</span>
							</div>

							<div className="flex flex-col gap-2">
								{/* Current User (You) */}
								<div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
											<User className="h-4 w-4 text-primary" />
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium">You</span>
											<span className="text-xs text-muted-foreground">
												Team Captain
											</span>
										</div>
									</div>
								</div>

								{/* Placeholder for other members */}
								<div className="flex items-center gap-2">
									<div className="relative flex-1">
										<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search by Discord name..."
											className="pl-9"
										/>
									</div>
									<Button variant="outline" size="icon">
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</Field>
					</FieldGroup>

					<div className="flex justify-end">
						<Button type="submit" disabled>
							Create Team
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
