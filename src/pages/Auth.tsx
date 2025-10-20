import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { Button } from "@/components/ui/button";

export default function Auth() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const [errorCode, setErrorCode] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");
		const error = searchParams.get("error");

		if (token) {
			signInWithCustomToken(auth, token)
				.then(() => {
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
				return "This Discord account is not associated with a registered participant. Let a staff member know if you think this is a mistake.";
			case "not_checked_in":
				return "You're a participant but it seems you haven't checked in yet! Please check in at the registration desk or let a staff member know if you think this is a mistake.";
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
				<div className="flex flex-col gap-4 items-center">
					<p>{getErrorMessage(errorCode)}</p>

					<Button variant="secondary" onClick={() => navigate("/login")}>
						Return to Login
					</Button>
				</div>
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
