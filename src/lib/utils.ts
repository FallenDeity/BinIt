import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export const CloudinaryTheme = {
	light: {
		palette: {
			window: "#FFFFFF",
			sourceBg: "#F4F4F4",
			windowBorder: "#8E9FBF",
			tabIcon: "#626A73",
			inactiveTabIcon: "#8E9FBF",
			menuIcons: "#626A73",
			link: "#0078D4",
			action: "#0078D4",
			inProgress: "#0078D4",
			complete: "#25D366",
			error: "#FF5252",
			textDark: "#201F1F",
			textLight: "#FFFFFF",
		},
		frame: {
			background: "rgba(255, 255, 255, 0.6)",
		},
	},
	dark: {
		palette: {
			window: "#101E23",
			sourceBg: "#101E23",
			windowBorder: "#8E9FBF",
			tabIcon: "#B0B3B8",
			inactiveTabIcon: "#8E9FBF",
			menuIcons: "#B0B3B8",
			link: "#1EBEA5",
			action: "#1EBEA5",
			inProgress: "#1EBEA5",
			complete: "#25D366",
			error: "#FF5252",
			textDark: "#EDEFF1",
			textLight: "#FFFFFF",
		},
		frame: {
			background: "rgba(16, 30, 35, 0.6)",
		},
	},
};

export const meta = {
	title: "Binit",
	description: "A responsive and modern real-time waste management system made with Next.js, Sockets, and Prisma.",
	keywords: ["Binit", "Infofest", "Next.js", "Sockets", "Prisma"],
	authors: [{ name: "FallenDeity" }],
	metadataBase: new URL(String(process.env.NEXT_PUBLIC_BASE_URL)),
	robots: {
		follow: true,
		index: false,
		nocache: true,
	},
	openGraph: {
		title: "Binit",
		description:
			"A responsive and modern real-time waste management system made with Next.js, Sockets, and Prisma.",
		images: "/logo.png",
		type: "website",
	},
	themeColor: "#03fc35",
};
