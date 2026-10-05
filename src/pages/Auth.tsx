import { FirebaseError } from "firebase/app";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

export default function Auth() {
	const navigate = useNavigate();

	const [errorCode, setErrorCode] = useState("");
	// the email is missing when the link is opened on a different device/browser
	const [needsEmail, setNeedsEmail] = useState(false);
	const [email, setEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);

	// a login link can only be used once, so make sure StrictMode's double effect doesn't consume it twice
	const attemptedRef = useRef(false);

	const completeLogin = async (loginEmail: string) => {
		setSubmitting(true);
		try {
			await authService.completeLogin(loginEmail, window.location.href);
			navigate("/", { replace: true });
		} catch (err) {
			console.error("Auth error:", err);
			setErrorCode(err instanceof FirebaseError ? err.code : "auth_error");
		} finally {
			setSubmitting(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: should only run once on page load
	useEffect(() => {
		if (attemptedRef.current) return;
		attemptedRef.current = true;

		if (!authService.isLoginLink(window.location.href)) {
			setErrorCode("invalid_link");
			return;
		}

		const savedEmail = authService.getSavedEmail();
		if (savedEmail) {
			completeLogin(savedEmail);
		} else {
			setNeedsEmail(true);
		}
	}, []);

	const handleEmailSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;
		setNeedsEmail(false);
		completeLogin(trimmed);
	};

	function getErrorMessage(code: string) {
		switch (code) {
			case "invalid_link":
				return "This doesn't look like a valid login link. Please request a new one.";
			case "auth/invalid-action-code":
			case "auth/expired-action-code":
				return "This login link has expired or was already used. Please request a new one.";
			case "auth/invalid-email":
				return "That email doesn't match the one this login link was sent to.";
			case "not_checked_in":
				return "You're a participant but it seems you haven't checked in yet!\n\nPlease check in at the registration desk or let a staff member know if you think this is a mistake.";
			case "login_disabled":
				return "Login is not available yet. Please wait for the event to begin!";
			default:
				return "An unexpected error occurred while logging in. Please try again.";
		}
	}

	if (needsEmail) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center h-screen text-center px-4">
				<h1 className="font-synemono text-4xl">Confirm your email</h1>
				<p>
					Looks like you opened this link on a different device. Please enter
					the email you requested the login link with.
				</p>
				<form
					onSubmit={handleEmailSubmit}
					className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
				>
					<Input
						type="email"
						required
						autoComplete="email"
						placeholder="you@example.com"
						aria-label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Button type="submit">Continue</Button>
				</form>
			</div>
		);
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
			) : submitting ? (
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
