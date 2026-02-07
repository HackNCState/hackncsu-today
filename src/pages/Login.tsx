import { Button } from "@/components/ui/button";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { authService } from "@/services/auth.service";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/user";

export default function Login() {
	const navigation = useNavigate();
	const user = useAtomValue(userAtom);
	const loading = user === undefined;

	const handleDiscordLogin = () => {
		authService.startOAuth();
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
					Discord account you used at registration.
				</p>
				<p>
					Thank you for joining us this weekend. We hope you have a great time!
				</p>
			</main>

			<Button
				className="w-full sm:w-auto"
				size="lg"
				onClick={handleDiscordLogin}
			>
				Log in
			</Button>

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
