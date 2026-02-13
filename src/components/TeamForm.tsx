import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogFooter } from "@/components/ui/dialog";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
	FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PlusIcon, Trash2, User } from "lucide-react";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { functionsService } from "@/services/functions.service";
import type { PartialParticipant } from "@/types/user";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import type { ChallengeCategory } from "@/types/event";

export interface TeamFormSubmitPayload {
	name: string;
	track: string;
	mentoringHelp: string;
	challenges: string[];
	memberIds: string[];
}

interface TrackOption {
	name: string;
	description?: string;
}

interface ChallengeOption {
	name: string;
	description?: string;
	category?: ChallengeCategory;
}

interface TeamFormInitialValues {
	name: string;
	track: string;
	mentoringHelp: string;
	challenges: string[];
	members: PartialParticipant[];
}

interface TeamFormProps {
	tracks: TrackOption[];
	challenges: ChallengeOption[];
	initialValues?: TeamFormInitialValues;
	lockedMemberIds?: string[];
	currentUserId?: string;
	currentUserLabel?: string;
	submitLabel?: string;
	minMembers?: number;
	maxMembers?: number;
	onSubmit: (payload: TeamFormSubmitPayload) => Promise<void>;
	onSuccess?: () => void;
}

export default function TeamForm({
	tracks,
	challenges,
	initialValues,
	lockedMemberIds = [],
	currentUserId,
	currentUserLabel,
	submitLabel = "Submit Registration",
	minMembers = 2,
	maxMembers = 4,
	onSubmit,
	onSuccess,
}: TeamFormProps) {
	const baseId = useId();
	const [members, setMembers] = useState<PartialParticipant[]>(
		initialValues?.members ?? [],
	);
	const [selectedTrack, setSelectedTrack] = useState(
		initialValues?.track ?? "",
	);

	// Split challenges by category
	const defaultChallenges = useMemo(
		() => challenges.filter((c) => (c.category ?? "default") === "default"),
		[challenges],
	);
	const mlhChallenges = useMemo(
		() => challenges.filter((c) => c.category === "mlh"),
		[challenges],
	);

	// Default challenge: single-select via radio (stores one name or "none")
	const [selectedDefaultChallenge, setSelectedDefaultChallenge] =
		useState<string>(() => {
			const initial = initialValues?.challenges ?? [];
			const defaultNames = new Set(
				defaultChallenges.map((c) => c.name),
			);
			return initial.find((c) => defaultNames.has(c)) ?? "none";
		});

	// MLH challenges: multi-select via checkboxes (stores set of names)
	const [selectedMlhChallenges, setSelectedMlhChallenges] = useState<
		Set<string>
	>(() => {
		const initial = initialValues?.challenges ?? [];
		const mlhNames = new Set(mlhChallenges.map((c) => c.name));
		return new Set(initial.filter((c) => mlhNames.has(c)));
	});
	const [teamName, setTeamName] = useState(initialValues?.name ?? "");
	const [mentoringHelp, setMentoringHelp] = useState(
		initialValues?.mentoringHelp ?? "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// search state
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<PartialParticipant[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setMembers(initialValues?.members ?? []);
		setSelectedTrack(initialValues?.track ?? "");
		setTeamName(initialValues?.name ?? "");
		setMentoringHelp(initialValues?.mentoringHelp ?? "");

		const initial = initialValues?.challenges ?? [];
		const defaultNames = new Set(defaultChallenges.map((c) => c.name));
		const mlhNames = new Set(mlhChallenges.map((c) => c.name));
		setSelectedDefaultChallenge(
			initial.find((c) => defaultNames.has(c)) ?? "none",
		);
		setSelectedMlhChallenges(new Set(initial.filter((c) => mlhNames.has(c))));
	}, [initialValues, defaultChallenges, mlhChallenges]);

	const filteredSearchResults = useMemo(
		() => searchResults.filter((u) => !members.some((m) => m.id === u.id)),
		[searchResults, members],
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
				setSearchResults(users);
			} catch (error) {
				console.error("Search failed", error);
			} finally {
				setLoading(false);
			}
		};

		const timeoutId = setTimeout(searchUsers, 300);
		return () => clearTimeout(timeoutId);
	}, [query]);

	const addMember = (newMember: PartialParticipant) => {
		if (members.length >= maxMembers) return;
		if (members.find((m) => m.id === newMember.id)) return;
		setMembers((prev) => [...prev, newMember]);
		setOpen(false);
		setQuery("");
	};

	const removeMember = (userId: string) => {
		if (lockedMemberIds.includes(userId)) return;
		setMembers((prev) => prev.filter((m) => m.id !== userId));
	};

	const getErrorMessage = (error: unknown) => {
		if (error instanceof Error) return error.message;
		if (typeof error === "string") return error;
		return "Failed to submit team";
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (members.length < minMembers) return;

		setIsSubmitting(true);
		setSubmitError(null);

		const mergedChallenges = [
			...(selectedDefaultChallenge !== "none"
				? [selectedDefaultChallenge]
				: []),
			...selectedMlhChallenges,
		];

		try {
			await onSubmit({
				name: teamName,
				track: selectedTrack,
				mentoringHelp,
				challenges: mergedChallenges,
				memberIds: members.map((m) => m.id),
			});
			onSuccess?.();
		} catch (error) {
			console.error("Team submit failed", error);
			setSubmitError(getErrorMessage(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	const teamNameId = `${baseId}-team-name`;
	const trackId = `${baseId}-track`;
	const defaultChallengeNoneId = `${baseId}-challenge-none`;
	const mentoringId = `${baseId}-mentoring`;

	return (
		<form onSubmit={handleSubmit}>
			<FieldGroup className="py-4">
				{/* Team Name */}
				<Field>
					<FieldContent>
						<FieldLabel htmlFor={teamNameId}>Team Name</FieldLabel>
						<FieldDescription>
							If you can&apos;t think of a team name, just use your project
							name!
						</FieldDescription>
					</FieldContent>
					<Input
						id={teamNameId}
						placeholder="Enter your team name"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						required
					/>
				</Field>

				{/* Track Selection */}
				<Field>
					<FieldContent>
						<FieldLabel htmlFor={trackId}>Track</FieldLabel>
						<FieldDescription>
							Select the track your team will participate in.
						</FieldDescription>
					</FieldContent>
					<Select value={selectedTrack} onValueChange={setSelectedTrack}>
						<SelectTrigger id={trackId} className="w-full">
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
										{track.description && (
											<span className="text-sm text-muted-foreground whitespace-normal">
												{track.description}
											</span>
										)}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>

				{/* Challenge Selection */}
				{defaultChallenges.length > 0 && (
					<Field>
						<FieldContent>
							<FieldLabel>Challenge (Optional)</FieldLabel>
							<FieldDescription>
								Select a challenge your team will participate in.
							</FieldDescription>
						</FieldContent>
						<RadioGroup
							value={selectedDefaultChallenge}
							onValueChange={setSelectedDefaultChallenge}
							variant="compact"
							className="flex flex-col gap-3 py-2"
						>
							{defaultChallenges.map((challenge) => (
								<Field key={challenge.name} orientation="horizontal">
									<RadioGroupItem
										value={challenge.name}
										id={`${baseId}-challenge-${challenge.name}`}
									/>
									<FieldContent>
										<FieldLabel
											htmlFor={`${baseId}-challenge-${challenge.name}`}
										>
											{challenge.name}
										</FieldLabel>
										{challenge.description && (
											<FieldDescription>
												{challenge.description}
											</FieldDescription>
										)}
									</FieldContent>
								</Field>
							))}
							<Field orientation="horizontal">
								<RadioGroupItem
									value="none"
									id={defaultChallengeNoneId}
								/>
								<FieldContent>
									<FieldLabel htmlFor={defaultChallengeNoneId}>
										No specific challenge
									</FieldLabel>
								</FieldContent>
							</Field>
						</RadioGroup>
					</Field>
				)}

				{/* MLH Challenge Selection (multi-select) */}
				{mlhChallenges.length > 0 && (
					<Field>
						<FieldContent>
							<FieldLabel>MLH Challenges (Optional)</FieldLabel>
							<FieldDescription>
								Select any MLH challenges your team wants to participate in.
								You can choose multiple.
							</FieldDescription>
						</FieldContent>
						<div className="flex flex-col gap-3 py-2">
							{mlhChallenges.map((challenge) => {
								const checked = selectedMlhChallenges.has(challenge.name);
								const checkboxId = `${baseId}-mlh-${challenge.name}`;
								return (
									<Field key={challenge.name} orientation="horizontal">
										<Checkbox
											id={checkboxId}
											checked={checked}
											onCheckedChange={(val) => {
												setSelectedMlhChallenges((prev) => {
													const next = new Set(prev);
													if (val) {
														next.add(challenge.name);
													} else {
														next.delete(challenge.name);
													}
													return next;
												});
											}}
										/>
										<FieldContent>
											<FieldLabel htmlFor={checkboxId}>
												{challenge.name}
											</FieldLabel>
											{challenge.description && (
												<FieldDescription>
													{challenge.description}
												</FieldDescription>
											)}
										</FieldContent>
									</Field>
								);
							})}
						</div>
					</Field>
				)}

				{/* Members Section */}
				<Field>
					<div className="flex items-center justify-between">
						<FieldLabel>
							Members ({members.length}/{maxMembers})
						</FieldLabel>
						
						<span className="text-xs text-muted-foreground">
							Min {minMembers} members required
						</span>
					</div>
					<FieldDescription>
						Ensure that all your team members have logged into Hack_NCState Today at least once in order to appear in the search results.
					</FieldDescription>

					<div className="flex flex-col gap-2">
						<ItemGroup>
							{members.map((member, index) => {
								const isCurrentUser = member.id === currentUserId;
								const isLocked = lockedMemberIds.includes(member.id);

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
														? `${currentUserLabel ?? member.username} (You)`
														: member.username}
												</ItemTitle>
											</ItemContent>
											{!isLocked && (
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
						{members.length < maxMembers && (
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
													<CommandEmpty>
														No users found
													</CommandEmpty>
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

				{/* Mentoring Request */}
				<Field>
					<FieldContent>
						<FieldLabel htmlFor={mentoringId}>
							Do you need any mentoring on a specific subject?
						</FieldLabel>
						<FieldDescription>
							If you don&apos;t have any specific mentoring needs, you can leave
							this blank.
						</FieldDescription>
					</FieldContent>
					<Input
						id={mentoringId}
						placeholder="e.g. using GitHub, building UI, etc."
						value={mentoringHelp}
						onChange={(e) => setMentoringHelp(e.target.value)}
					/>
				</Field>
			</FieldGroup>

			{submitError && (
				<div className="text-destructive text-sm mb-4">{submitError}</div>
			)}

			<DialogFooter>
				<Button
					type="submit"
					disabled={members.length < minMembers || isSubmitting}
				>
					{isSubmitting ? "Submitting..." : submitLabel}
				</Button>
			</DialogFooter>
		</form>
	);
}
