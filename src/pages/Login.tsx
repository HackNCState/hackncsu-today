import { FirebaseError } from "firebase/app";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAtom } from "@/atoms/user";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

function getLoginErrorMessage(err: unknown) {
	const reason =
		err instanceof FirebaseError
			? (err as FirebaseError & { details?: { reason?: string } }).details
					?.reason
			: undefined;

	switch (reason) {
		case "invalid_email":
			return "Please enter a valid email address.";
		case "not_checked_in":
			return "We couldn't find a checked-in participant with that email. Please check in at the registration desk, or make sure you're using the email you registered with.";
		case "login_disabled":
			return "Login is not available yet. Please wait for the event to begin!";
		default:
			return "We couldn't send a login link. Please try again.";
	}
}

export default function Login() {
	const navigation = useNavigate();
	const user = useAtomValue(userAtom);
	const loading = user === undefined;

	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [sentTo, setSentTo] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;

		setSending(true);
		setError(null);
		try {
			await authService.sendLoginLink(trimmed);
			setSentTo(trimmed);
		} catch (err) {
			console.error("Failed to send login link:", err);
			setError(getLoginErrorMessage(err));
		} finally {
			setSending(false);
		}
	};

	useEffect(() => {
		if (!loading && user) {
			navigation("/", { replace: true });
		}
	}, [user, loading, navigation]);

	return (
		<div className="flex flex-col gap-8 sm:items-center justify-center sm:text-center p-4 lg:mx-64 sm:p-8 min-h-screen">
			<header>
				<h1 className="font-playfair font-semibold text-5xl sm:text-7xl">
					Hack_NCState Today
				</h1>
				<title>Hack_NCState Today - Login</title>
				<meta
					name="description"
					content="The essential platform for Hack_NCState 2026 participants."
				/>
			</header>
			<main className="font-synemono sm:text-2xl flex flex-col gap-4">
				<p>
					Welcome to Hack_NCState 2026! Please check in, then log in with the
					email you used at registration.
				</p>
				<p>
					Thank you for joining us this weekend. We hope you have a great time!
				</p>
			</main>

			{sentTo ? (
				<div className="flex flex-col gap-2 sm:items-center">
					<p className="font-synemono">
						Check your inbox! We sent a login link to <strong>{sentTo}</strong>.
					</p>
					<Button
						variant="link"
						className="text-muted-foreground w-fit"
						onClick={() => setSentTo(null)}
					>
						Use a different email
					</Button>
				</div>
			) : (
				<form
					onSubmit={handleEmailLogin}
					className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-md"
				>
					<Input
						type="email"
						required
						autoComplete="email"
						placeholder="you@example.com"
						aria-label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="h-10"
					/>
					<Button
						type="submit"
						size="lg"
						disabled={sending}
						className="w-full sm:w-auto"
					>
						{sending ? "Sending..." : "Log in with email"}
					</Button>
				</form>
			)}
			{error && <p className="text-sm text-destructive">{error}</p>}

			<p className="font-splash text-2xl select-none mx-auto">
				Team Hack_NCState
			</p>

			<Dialog>
				<DialogTrigger asChild>
					<Button variant="link" className="text-muted-foreground">
						Learn more
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>About Hack_NCState Today</DialogTitle>
						<DialogDescription>
							<div>
								Hack_NCState Today is your one-stop platform for everything.
								Create your team, view announcements, access useful resources,
								follow the event schedule, share your resume with our sponsors,
								and more! Everything is live and updated in real-time throughout
								the event.
							</div>
							<br />
							<div>
								You need to log in at least once to be registered as a user.
								Once you do, you'll also be able to enable notifications to stay
								informed even when busy hacking.
							</div>
							<br />
							<div>
								This year is our first time launching this platform, so we'd
								love to hear your feedback after the event!
							</div>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
}
