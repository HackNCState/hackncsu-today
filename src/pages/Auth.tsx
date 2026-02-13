import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

export default function Auth() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const [errorCode, setErrorCode] = useState("");
	const [authenticating, setAuthenticating] = useState(true);

	useEffect(() => {
		const token = searchParams.get("token");
		const error = searchParams.get("error");

		if (token) {
			authService
				.login(token)
				.then(() => {
					setAuthenticating(false);
					navigate("/");
				})
				.catch((err) => {
					console.error("Auth error:", err);
					setErrorCode("auth_error");
				});
		} else if (error) {
			console.error("Authentication failed");
			setErrorCode(error);
		} else {
			setErrorCode("no_token");
		}
	}, [navigate, searchParams]);

	function getErrorMessage(code: string) {
		switch (code) {
			case "invalid_token":
				return "Invalid authorization token. Please try logging in again.";
			case "participant_not_found":
				return (
					"This Discord account is not associated with a registered participant.\n\n" +
					"If you think this is a mistake, please open a support ticket in the Hack_NCState 2026 Discord server.\n" +
					"Include your full name and email used during registration."
				);
			case "not_checked_in":
				return "You're a participant but it seems you haven't checked in yet!\n\nPlease check in at the registration desk or let a staff member know if you think this is a mistake.";
			case "login_disabled":
				return "Login is not available yet. Please wait for the event to begin!";
			case "missing_info":
				return "Participant information is incomplete. Please contact a staff member.";
			case "auth_error":
				return "An unexpected error occurred while logging in. Please try again.";
			case "no_token":
				return "No authentication token provided.";
			default:
				return "An unknown error occurred.";
		}
	}

	return (
		<div className="flex flex-col gap-2 items-center justify-center h-screen text-center px-4">
			<h1 className="font-synemono text-4xl">
				{errorCode ? "Authentication Failed" : "One moment please"}
			</h1>
			{errorCode ? (
				<div className="flex flex-col gap-4 items-center whitespace-pre-wrap">
					<p>{getErrorMessage(errorCode)}</p>

					<Button variant="secondary" onClick={() => navigate("/login")}>
						Return to Login
					</Button>
				</div>
			) : authenticating ? (
				<p>We're logging you in.</p>
			) : (
				<p>
					If you are not redirected automatically, please click{" "}
					<a className="underline" href="/">
						here
					</a>
					.
				</p>
			)}
		</div>
	);
}
