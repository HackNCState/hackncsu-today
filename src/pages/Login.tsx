import { Button } from "@/components/ui/button";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const navigation = useNavigate();

	const handleDiscordLogin = () => {
		// TODO: Implement Firebase Discord OAuth

		navigation("/");
	};

	return (
		<div className="flex flex-col gap-8 items-center justify-center sm:text-center p-4 sm:p-8 min-h-screen">
			<header>
				<h1 className="font-playfair font-semibold text-5xl sm:text-7xl">
					Hack_NCState Today
				</h1>
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
				<DialogTrigger>
					<Button variant="link" className="text-muted-foreground">
						Learn more
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>About Hack_NCState Today</DialogTitle>
						<DialogDescription>
							<p>
								The Hack_NCState Today platform is designed to enhance your
								hackathon experience by providing real-time updates,
								announcements, and resources throughout the event.
							</p>
							<br />
							<p>
								As long as you leave this page open, you'll receive
								notifications about important happenings during the hackathon.
							</p>
							<br />
							<p>
								This year is our first time launching this platform, so we'd
								love to hear your feedback!
							</p>
							<br />
							<p>Made with ❤️ by the Hack_NCState team.</p>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
}
