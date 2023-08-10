"use client";

import "react-toastify/dist/ReactToastify.css";

import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { useGeolocated } from "react-geolocated";
import { BiLogInCircle, BiSolidDashboard } from "react-icons/bi";
import { BsFillSendFill } from "react-icons/bs";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";

import getCurrentUser from "@/actions/getCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav(): React.JSX.Element {
	const router = useRouter();
	const { systemTheme, theme, setTheme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const [user, setUser] = React.useState<User | null>(null);
	const [modalOpen, setModalOpen] = React.useState(false);
	const [sending, setSending] = React.useState(false);
	const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
		positionOptions: {
			enableHighAccuracy: false,
		},
		userDecisionTimeout: 5000,
	});

	React.useEffect(() => {
		void getCurrentUser().then((user) => setUser(user));
	}, []);
	const upload = (result: { info: { secure_url: string } }): void => {
		if (sending) return;
		setSending(true);
		void axios
			.post("/api/dump", {
				location: `https://maps.google.com/maps?q=${String(coords?.latitude)},${String(
					coords?.longitude
				)}&z=15&output=embed`,
				image: result.info.secure_url,
				userId: user?.id,
			})
			.then(() => {
				toast.success("Reported successfully.");
				setModalOpen(false);
				setSending(false);
			})
			.catch(() => {
				toast.error("Something went wrong.");
				setSending(false);
			});
	};
	return (
		<>
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={isDark ? "dark" : "light"}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user?.image ?? ""} alt="@shadcn" />
							<AvatarFallback className="bg-green-600">
								{(user?.name ?? "NA").slice(0, 2).toLocaleUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-48" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{user?.name}</p>
							<p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={(): void => router.push("/dashboard")}>
							Dashboard
							<DropdownMenuShortcut>
								<BiSolidDashboard size={15} />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(): void => {
								if (!isGeolocationAvailable) {
									toast.error("Your browser does not support Geolocation.");
									return;
								}
								if (!isGeolocationEnabled) {
									toast.error("Geolocation is not enabled.");
									return;
								}
								setModalOpen(true);
							}}>
							Report
							<DropdownMenuShortcut>
								<BsFillSendFill size={15} />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={(): void => setTheme(isDark ? "light" : "dark")}>
							{isDark ? "Light" : "Dark"}
							<DropdownMenuShortcut>
								{isDark ? <RiSunFill size={15} /> : <RiMoonClearFill size={15} />}
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={(): void => void signOut()}>
						Log out
						<DropdownMenuShortcut>
							<BiLogInCircle size={15} />
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog open={modalOpen}>
				<DialogContent
					className="sm:max-w-[425px]"
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					callback={(): void => {
						setModalOpen(false);
					}}>
					<DialogHeader>
						<DialogTitle>Report</DialogTitle>
						<DialogDescription>Report a disposal onclave that is breaking the rules.</DialogDescription>
					</DialogHeader>
					<div className="flex w-full flex-col items-center justify-center">
						<iframe
							className="mt-5 h-72 w-full"
							src={`https://maps.google.com/maps?q=${String(coords?.latitude)},${String(
								coords?.longitude
							)}&z=15&output=embed`}
							loading="lazy"
						/>
					</div>
					<DialogFooter>
						<Button
							disabled={sending}
							className="w-full disabled:cursor-not-allowed disabled:bg-opacity-50"
							onClick={(): void => upload({ info: { secure_url: "" } })}
							type="submit">
							{sending ? <ClipLoader size={15} /> : "Report"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
