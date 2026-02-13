import { useEffect, useState } from "react";

const breakpoints = {
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useMediaQuery(query: string) {
	const [value, setValue] = useState(false);

	useEffect(() => {
		function onChange(event: MediaQueryListEvent) {
			setValue(event.matches);
		}

		const result = matchMedia(query);
		result.addEventListener("change", onChange);
		setValue(result.matches);

		return () => result.removeEventListener("change", onChange);
	}, [query]);

	return value;
}

export function useBreakpoint(breakpoint: Breakpoint) {
	return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}
