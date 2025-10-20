import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase-config";

export default function Auth() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	// TODO: handle errors better (make screen better) and navigate from Login to / if auth is successful
	useEffect(() => {
		const token = searchParams.get("token");
		const error = searchParams.get("error");

		if (token) {
			// Sign in with the token
			signInWithCustomToken(auth, token)
				.then(() => {
					navigate("/");
				})
				.catch((err) => {
					console.error("Auth error:", err);
					// Handle error
				});
		} else if (error) {
			// Handle error case
			console.error("Authentication failed");
		}
	}, [navigate, searchParams]);

	return <div>Authenticating...</div>;
}
