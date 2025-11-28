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
		<div className="flex flex-col gap-8 items-center justify-center sm:text-center p-4 sm:p-8 min-h-screen">
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

			<p className="font-splash text-2xl select-none">Team Hack_NCState</p>

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
								The Hack_NCState Today platform is designed to enhance your
								hackathon experience by providing real-time updates,
								announcements, and resources throughout the event.
							</div>
							<br />
							<div>
								As long as you leave this page open, you'll receive
								notifications about important happenings during the hackathon.
							</div>
							<br />
							<div>
								This year is our first time launching this platform, so we'd
								love to hear your feedback!
							</div>
							<br />
							<div>Made with ❤️ by the Hack_NCState team.</div>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
}
