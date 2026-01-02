import { useAtomValue } from "jotai";
import { tracksAtom } from "@/atoms/event/tracks";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import {
	ArrowRight,
	Check,
	ChevronsUpDown,
	Delete,
	DeleteIcon,
	Plus,
	PlusIcon,
	Search,
	Trash2,
	User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { functionsService } from "@/services/functions.service";
import {
	PartialParticipantSchema,
	type PartialParticipant,
} from "@/types/user";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item";
import React from "react";
import { userAtom } from "@/atoms/user";

export default function UnregisteredView() {
	const tracks = useAtomValue(tracksAtom);
	const user = useAtomValue(userAtom);

	const [invitedMembers, setInvitedMembers] = useState<PartialParticipant[]>(
		[],
	);

	const members = user
		? [PartialParticipantSchema.parse(user), ...invitedMembers]
		: invitedMembers;

	const [selectedTrack, setSelectedTrack] = useState("");

	// Search state
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<PartialParticipant[]>([]);
	const [loading, setLoading] = useState(false);

	const filteredSearchResults = searchResults.filter(
		(u) => !members.some((m) => m.id === u.id),
	);

	useEffect(() => {
		const searchUsers = async () => {
			if (query.length < 2) {
				setSearchResults([]);
				return;
			}

			setLoading(true);
			try {
				const users = await functionsService.searchUsers(query);
				setSearchResults(users.filter((u) => u.id !== user?.id));
			} catch (error) {
				console.error("Search failed", error);
			} finally {
				setLoading(false);
			}
		};

		const timeoutId = setTimeout(searchUsers, 300);
		return () => clearTimeout(timeoutId);
	}, [query, user]);

	const addMember = (newMember: PartialParticipant) => {
		if (members.length >= 4) return;
		if (members.find((m) => m.id === newMember.id)) return;
		setInvitedMembers([...invitedMembers, newMember]);
		setOpen(false);
		setQuery("");
	};

	const removeMember = (userId: string) => {
		setInvitedMembers(invitedMembers.filter((m) => m.id !== userId));
	};

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
							<FieldDescription>
								If you can't think of a team name, just use your project name!
							</FieldDescription>
							<Input id="team-name" placeholder="Enter your team name" />
						</Field>

						{/* Track Selection */}
						<Field>
							<FieldLabel htmlFor="track">Track</FieldLabel>
							<FieldDescription>
								Select the track your team will participate in.
							</FieldDescription>
							<Select value={selectedTrack} onValueChange={setSelectedTrack}>
								<SelectTrigger id="track" className="w-full">
									<SelectValue placeholder="Select a track">
										{selectedTrack === "" ? undefined : selectedTrack}
									</SelectValue>
								</SelectTrigger>
								<SelectContent
									position="popper"
									className="w-[var(--radix-select-trigger-width)]"
								>
									{tracks.map((track) => (
										<SelectItem key={track.name} value={track.name}>
											<span className="flex flex-col items-start text-left">
												<span className="font-medium">{track.name}</span>
												<span className="text-sm text-muted-foreground whitespace-normal">
													{track.description}
												</span>
											</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						{/* Members Section */}
						<Field>
							<div className="flex items-center justify-between">
								<FieldLabel>Members ({members.length}/4)</FieldLabel>
								<span className="text-xs text-muted-foreground">
									Min 2 members required
								</span>
							</div>

							<div className="flex flex-col gap-2">
								<ItemGroup>
									{members.map((member, index) => {
										const isCurrentUser = member.id === user?.id;

										return (
											<React.Fragment key={member.id}>
												{index > 0 && <ItemSeparator />}
												<Item>
													<ItemMedia variant="icon">
														<User className="h-4 w-4" />
													</ItemMedia>
													<ItemContent>
														<ItemTitle>
															{isCurrentUser
																? `${user?.username} (You)`
																: member.username}
														</ItemTitle>
													</ItemContent>
													{!isCurrentUser && (
														<ItemActions>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => removeMember(member.id)}
																type="button"
															>
																<Trash2 className="h-4 w-4 text-destructive" />
															</Button>
														</ItemActions>
													)}
												</Item>
											</React.Fragment>
										);
									})}
								</ItemGroup>

								{/* Search Input */}
								{members.length < 4 && (
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className=""
											>
												<span className="text-muted-foreground flex items-center gap-2">
													<PlusIcon className="h-4 w-4" />
													Add member to team
												</span>
											</Button>
										</PopoverTrigger>

										<PopoverContent className="w-[400px] p-0" align="start">
											<Command shouldFilter={false}>
												<CommandInput
													placeholder="Search members by Discord username..."
													value={query}
													onValueChange={setQuery}
												/>
												<CommandList>
													{loading && (
														<div className="py-6 text-center text-sm text-muted-foreground">
															Searching...
														</div>
													)}
													{!loading && query.length < 2 && (
														<div className="py-6 text-center text-sm text-muted-foreground">
															Type at least 2 characters to see results
														</div>
													)}
													{!loading &&
														query.length >= 2 &&
														filteredSearchResults.length === 0 && (
															<CommandEmpty>No users found.</CommandEmpty>
														)}
													{!loading &&
														filteredSearchResults.map((user) => (
															<CommandItem
																key={user.id}
																value={user.username}
																onSelect={() => addMember(user)}
															>
																{user.username}
															</CommandItem>
														))}
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								)}
							</div>
						</Field>
					</FieldGroup>

					<DialogFooter>
						<Button type="submit" disabled={members.length < 2}>
							Submit Registration
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
