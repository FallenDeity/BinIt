"use client";

import "react-toastify/dist/ReactToastify.css";

import { User } from "@prisma/client";
import Lottie from "lottie-react";
import { useTheme } from "next-themes";
import React from "react";
import { ToastContainer } from "react-toastify";

import getCurrentUser from "@/actions/getCurrentUser";
import animationData from "@/assets/animation_ll4wg20p.json";
import { pusherClient } from "@/lib/pusher";

import ContractorBoard from "./ContractorBoard";
import UserBoard from "./UserBoard";

export default function Board(): React.JSX.Element {
	const { systemTheme, theme } = useTheme();
	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const [user, setUser] = React.useState<User | null>(null);
	const pusherKey = React.useMemo(() => user?.id, [user?.id]);
	React.useEffect(() => {
		void getCurrentUser().then((user) => setUser(user));
	}, []);
	React.useEffect(() => {
		if (!pusherKey) return;
		pusherClient.subscribe(pusherKey);
		const updateHandler = (data: { updateUser: User }): void => {
			setUser(data.updateUser);
		};
		pusherClient.bind("user:update", updateHandler);
		return () => {
			pusherClient.unbind("user:update", updateHandler);
			pusherClient.unsubscribe(pusherKey);
		};
	}, [pusherKey]);
	return (
		<>
			{user ? (
				user.isContractor ? (
					<ContractorBoard />
				) : (
					<UserBoard />
				)
			) : (
				<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f0f2f5] to-[#efeae2] py-12 dark:from-[#222e35] dark:to-[#0b141a] sm:px-6 lg:px-8">
					<Lottie animationData={animationData} loop={true} height={50} width={50} />
				</div>
			)}
			<ToastContainer
				position="top-center"
				autoClose={5000}
				closeOnClick
				pauseOnFocusLoss
				theme={isDark ? "dark" : "light"}
			/>
		</>
	);
}
