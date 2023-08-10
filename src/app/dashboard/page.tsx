"use client";

import { Dump, User } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { BsFillPatchCheckFill, BsFillPatchExclamationFill } from "react-icons/bs";
import Moment from "react-moment";

import getCurrentUser from "@/actions/getCurrentUser";
import getUserRank from "@/actions/getUserRank";
import getUserReports from "@/actions/getUserReports";
import { CalendarDateRangePicker } from "@/components/Dashboard/date-range-picker";
import { MainNav } from "@/components/Dashboard/main-nav";
import { Overview } from "@/components/Dashboard/overview";
import { RecentSales } from "@/components/Dashboard/recent-sales";
import { UserNav } from "@/components/Dashboard/user-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pusherClient } from "@/lib/pusher";

export default function DashboardPage(): React.JSX.Element {
	const [user, setUser] = React.useState<User | null>();
	const [userReports, setUserReports] = React.useState<Dump[]>([]);
	const [userRank, setUserRank] = React.useState<{ rank: number; total: number }>({ rank: 0, total: 0 });
	React.useEffect(() => {
		void getCurrentUser().then((user) => setUser(user));
	}, []);
	React.useEffect(() => {
		if (user) {
			void getUserReports().then((userReports) => setUserReports(userReports));
		}
	}, [user]);
	React.useEffect(() => {
		if (user) {
			void getUserRank().then((userRank) => setUserRank(userRank));
		}
	}, [user, userReports]);
	React.useEffect(() => {
		pusherClient.subscribe("dump");
		const newHandler = (dump: Dump): void => {
			setUserReports((userReports) => [dump, ...userReports]);
		};
		pusherClient.bind("dump:new", newHandler);
		return () => {
			pusherClient.unbind("dump:new", newHandler);
			pusherClient.unsubscribe("dump");
		};
	}, []);
	const percChangeFromLastMonth = (): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		return (thisMonthReports.length - lastMonthReports.length) / (lastMonthReports.length || 1);
	};
	const percCompletedFromLastMonth = (): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		const thisMonthCompleted = thisMonthReports.filter((report) => report.completed);
		const lastMonthCompleted = lastMonthReports.filter((report) => report.completed);
		return (thisMonthCompleted.length - lastMonthCompleted.length) / (lastMonthCompleted.length || 1);
	};
	const percIncompleteFromLastMonth = (): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = userReports.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		const thisMonthIncomplete = thisMonthReports.filter((report) => !report.completed);
		const lastMonthIncomplete = lastMonthReports.filter((report) => !report.completed);
		return (thisMonthIncomplete.length - lastMonthIncomplete.length) / (lastMonthIncomplete.length || 1);
	};
	return (
		<>
			<div className="flex-col md:flex">
				<div className="border-b">
					<div className="flex h-16 items-center px-4">
						<MainNav className="mx-6" />
						<div className="ml-auto flex items-center space-x-6">
							<UserNav />
						</div>
					</div>
				</div>
				<div className="flex-1 space-y-4 p-2 pt-6 sm:p-8">
					<div className="flex flex-col items-center justify-between space-y-2 sm:flex-row">
						<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
						<div className="flex items-center space-x-2">
							<CalendarDateRangePicker />
						</div>
					</div>
					<Tabs defaultValue="overview" className="space-y-4">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="reports">Reports</TabsTrigger>
						</TabsList>
						<TabsContent value="overview" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Total Reports</CardTitle>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											className="h-4 w-4 text-muted-foreground">
											<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
										</svg>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{userReports.length}</div>
										<p className="text-xs text-muted-foreground">
											{percChangeFromLastMonth() * 100}% from last month
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Total Completed</CardTitle>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											className="h-4 w-4 text-muted-foreground">
											<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
										</svg>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{userReports.filter((report) => report.completed).length}
										</div>
										<p className="text-xs text-muted-foreground">
											{percCompletedFromLastMonth() * 100}% from last month
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											className="h-4 w-4 text-muted-foreground">
											<rect width="20" height="14" x="2" y="5" rx="2" />
											<path d="M2 10h20" />
										</svg>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">
											{userReports.filter((report) => !report.completed).length}
										</div>
										<p className="text-xs text-muted-foreground">
											{percIncompleteFromLastMonth() * 100}% from last month
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Your Rank</CardTitle>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											className="h-4 w-4 text-muted-foreground">
											<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
										</svg>
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{userRank.rank}</div>
										<p className="text-xs text-muted-foreground">Out of {userRank.total} users</p>
									</CardContent>
								</Card>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
								<Card className="col-span-4">
									<CardHeader>
										<CardTitle>Overview</CardTitle>
									</CardHeader>
									<CardContent className="pl-2">
										<Overview />
									</CardContent>
								</Card>
								<Card className="col-span-3">
									<CardHeader>
										<CardTitle>Recent Sales</CardTitle>
										<CardDescription>You made 265 sales this month.</CardDescription>
									</CardHeader>
									<CardContent>
										<RecentSales />
									</CardContent>
								</Card>
							</div>
						</TabsContent>
						<TabsContent value="reports" className="space-y-4">
							<section className="mx-auto mb-5 mt-10 grid w-fit grid-cols-1 justify-center justify-items-center gap-x-14 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
								{userReports.map((report) => (
									<div
										key={report.id}
										className="w-72 rounded-xl bg-gray-100 shadow-md duration-500 hover:shadow-xl dark:bg-gray-800 sm:hover:scale-105">
										{report.image ? (
											<Image
												className="h-56 w-full rounded-t-xl object-cover"
												src="https://tecdn.b-cdn.net/img/new/standard/city/044.webp"
												alt="Report"
												width={288}
												height={192}
											/>
										) : (
											<iframe
												src={report.location}
												className="h-56 w-full rounded-t-xl object-cover"
											/>
										)}
										<div className="mx-6">
											<div className="flex w-full flex-row items-center">
												<button className="mr-2 mt-2">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														stroke-width="2"
														stroke="#F8F19C"
														className="h-6 w-6">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
														/>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
														/>
													</svg>
												</button>
												<h5 className="mb-2 mt-4 truncate text-lg font-bold capitalize text-black dark:text-white">
													{user?.name}
												</h5>
											</div>
											<p className="mb-5 text-left tracking-tight text-neutral-900 dark:text-neutral-200">
												This is a wider card with supporting text below as a natural lead-in to
												additional content. This content is a little bit longer.
											</p>
											<div className="flex w-full items-center justify-between border-t border-neutral-700 py-4 text-left text-neutral-900 dark:border-neutral-100 dark:text-gray-50">
												<Moment className="text-sm" date={report.createdAt} fromNow />
												{report.completed ? (
													<BsFillPatchCheckFill className="h-5 w-5 text-green-500" />
												) : (
													<BsFillPatchExclamationFill className="h-5 w-5 text-red-500" />
												)}
											</div>
										</div>
									</div>
								))}
							</section>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
