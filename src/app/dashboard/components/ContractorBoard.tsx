"use client";

import { Dump, User } from "@prisma/client";
import axios from "axios";
import React from "react";
import { BsFillPatchCheckFill, BsFillPatchExclamationFill } from "react-icons/bs";
import Moment from "react-moment";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";

import getContractorRank from "@/actions/getContractorRank";
import getContractorWorks from "@/actions/getContractorWorks";
import getCurrentUser from "@/actions/getCurrentUser";
import getTasks from "@/actions/getTasks";
import getUserRank from "@/actions/getUserRank";
import getUserReports from "@/actions/getUserReports";
import { ContractorOverview } from "@/components/Dashboard/c-overview";
import { CalendarDateRangePicker } from "@/components/Dashboard/date-range-picker";
import { MainNav } from "@/components/Dashboard/main-nav";
import { Overview } from "@/components/Dashboard/overview";
import { RecentSales } from "@/components/Dashboard/recent-sales";
import { UserNav } from "@/components/Dashboard/user-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pusherClient } from "@/lib/pusher";

export default function ContractorBoard(): React.JSX.Element {
	const [user, setUser] = React.useState<User | null>();
	const [userReports, setUserReports] = React.useState<Dump[]>([]);
	const [tasks, setTasks] = React.useState<Dump[]>([]);
	const [contractorRank, setContractorRank] = React.useState<{ rank: number; total: number }>({ rank: 0, total: 0 });
	const [userRank, setUserRank] = React.useState<{ rank: number; total: number }>({ rank: 0, total: 0 });
	const [userTasks, setUserTasks] = React.useState<Dump[]>([]);
	const [loading, setLoading] = React.useState<boolean>(false);
	const [claimId, setClaimId] = React.useState<string>("");
	const [completeId, setCompleteId] = React.useState<string>("");
	const [cloading, setCloading] = React.useState<boolean>(false);
	const pusherKey = React.useMemo(() => user?.id, [user?.id]);
	React.useEffect(() => {
		void getCurrentUser().then((user) => setUser(user));
	}, []);
	React.useEffect(() => {
		void getContractorWorks().then((userTasks) => setUserTasks(userTasks));
	}, []);
	React.useEffect(() => {
		void getUserReports().then((userReports) => setUserReports(userReports));
	}, []);
	React.useEffect(() => {
		void getUserRank().then((userRank) => setUserRank(userRank));
	}, [userReports]);
	React.useEffect(() => {
		void getContractorRank().then((userRank) => setContractorRank(userRank));
	}, [userTasks]);
	React.useEffect(() => {
		void getTasks().then((tasks) => setTasks(tasks));
	}, []);
	React.useEffect(() => {
		pusherClient.subscribe("dump");
		const newHandler = (dump: { newDump: Dump }): void => {
			setUserReports((userReports) => [dump.newDump, ...userReports]);
		};
		pusherClient.bind("dump:new", newHandler);
		return () => {
			pusherClient.unbind("dump:new", newHandler);
			pusherClient.unsubscribe("dump");
		};
	}, []);
	React.useEffect(() => {
		if (!pusherKey) return;
		pusherClient.subscribe(pusherKey);
		const updateHandler = (dump: { updatedDump: Dump }): void => {
			if (!userReports.find((report) => report.id === dump.updatedDump.id)) {
				setUserReports((userReports) => [dump.updatedDump, ...userReports]);
			}
			setUserReports((userReports) =>
				userReports.map((report) => (report.id === dump.updatedDump.id ? dump.updatedDump : report))
			);
			if (!userTasks.find((task) => task.id === dump.updatedDump.id)) {
				setUserTasks((userTasks) => [dump.updatedDump, ...userTasks]);
			}
			setUserTasks((userTasks) =>
				userTasks.map((report) => (report.id === dump.updatedDump.id ? dump.updatedDump : report))
			);
		};
		pusherClient.bind("dump:update", updateHandler);
		return () => {
			pusherClient.unbind("dump:update", updateHandler);
			pusherClient.unsubscribe(pusherKey);
		};
	}, [pusherKey]);
	React.useEffect(() => {
		pusherClient.subscribe("removed");
		const removeHandler = (dump: { updatedDump: Dump }): void => {
			setTasks((tasks) => tasks.filter((report) => report.id !== dump.updatedDump.id));
		};
		pusherClient.bind("dump:update", removeHandler);
		return () => {
			pusherClient.unbind("dump:update", removeHandler);
			pusherClient.unsubscribe("removed");
		};
	}, []);
	React.useEffect(() => {
		pusherClient.subscribe("dump");
		const newHandler = (dump: { newDump: Dump }): void => {
			setTasks((tasks) => [dump.newDump, ...tasks]);
		};
		pusherClient.bind("dump:new", newHandler);
		return () => {
			pusherClient.unbind("dump:new", newHandler);
			pusherClient.unsubscribe("dump");
		};
	}, []);
	const completeTask = (userId: string, dumpId: string): void => {
		if (cloading) return;
		setCloading(true);
		setCompleteId(dumpId);
		void axios
			.post("/api/dump/completed", {
				userId,
				dumpId,
				assignedToId: user?.id,
			})
			.then(() => {
				toast.success("Task completed successfully");
			})
			.catch(() => {
				toast.error("Failed to complete task");
			})
			.finally(() => {
				setCloading(false);
				setCompleteId("");
			});
	};
	const claimTask = (userId: string, dumpId: string): void => {
		if (loading) return;
		setLoading(true);
		setClaimId(dumpId);
		void axios
			.post("/api/dump/assign", {
				userId,
				dumpId,
				assignedToId: user?.id,
			})
			.then(() => {
				toast.success("Task claimed successfully");
			})
			.catch(() => {
				toast.error("Failed to claim task");
			})
			.finally(() => {
				setLoading(false);
				setClaimId("");
			});
	};
	const percChangeFromLastMonth = (data: Dump[]): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		return (thisMonthReports.length - lastMonthReports.length) / (lastMonthReports.length || 1);
	};
	const percCompletedFromLastMonth = (data: Dump[]): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		const thisMonthCompleted = thisMonthReports.filter((report) => report.completed);
		const lastMonthCompleted = lastMonthReports.filter((report) => report.completed);
		return (thisMonthCompleted.length - lastMonthCompleted.length) / (lastMonthCompleted.length || 1);
	};
	const percIncompleteFromLastMonth = (data: Dump[]): number => {
		const thisMonth = new Date().getMonth();
		const lastMonth = thisMonth - 1;
		const thisMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		const lastMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === lastMonth);
		const thisMonthIncomplete = thisMonthReports.filter((report) => !report.completed);
		const lastMonthIncomplete = lastMonthReports.filter((report) => !report.completed);
		return (thisMonthIncomplete.length - lastMonthIncomplete.length) / (lastMonthIncomplete.length || 1);
	};
	const totalReportsThisMonth = (data: Dump[]): number => {
		const thisMonth = new Date().getMonth();
		const thisMonthReports = data.filter((report) => new Date(report.createdAt).getMonth() === thisMonth);
		return thisMonthReports.length;
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
							<TabsTrigger value="tasks">Tasks</TabsTrigger>
							<TabsTrigger value="stats">Stats</TabsTrigger>
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
											{percChangeFromLastMonth(userReports) * 100}% from last month
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
											{percCompletedFromLastMonth(userReports) * 100}% from last month
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
											{percIncompleteFromLastMonth(userReports) * 100}% from last month
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
										<Overview dumps={userReports} />
									</CardContent>
								</Card>
								<Card className="col-span-3">
									<CardHeader>
										<CardTitle>Claimed Reports</CardTitle>
										<CardDescription>
											You made {totalReportsThisMonth(userReports)} reports this month
										</CardDescription>
									</CardHeader>
									<CardContent>
										{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
										{/* @ts-expect-error */}
										<RecentSales reports={userReports} />
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
										<iframe
											src={report.location}
											className="h-56 w-full rounded-t-xl object-cover"
										/>
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
											<p className="mb-5 line-clamp-2 text-left tracking-tight text-neutral-900 dark:text-neutral-200">
												{report.description}
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
						<TabsContent value="stats" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
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
										<div className="text-2xl font-bold">{userTasks.length}</div>
										<p className="text-xs text-muted-foreground">
											{percChangeFromLastMonth(userTasks) * 100}% from last month
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
											{userTasks.filter((report) => report.completed).length}
										</div>
										<p className="text-xs text-muted-foreground">
											{percCompletedFromLastMonth(userTasks) * 100}% from last month
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
											{userTasks.filter((report) => !report.completed).length}
										</div>
										<p className="text-xs text-muted-foreground">
											{percIncompleteFromLastMonth(userTasks) * 100}% from last month
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
										<div className="text-2xl font-bold">{contractorRank.rank}</div>
										<p className="text-xs text-muted-foreground">
											Out of {contractorRank.total} contractors
										</p>
									</CardContent>
								</Card>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
								<Card className="col-span-4 lg:col-span-3">
									<CardHeader>
										<CardTitle>Claimed Tasks</CardTitle>
										<CardDescription>
											You made {totalReportsThisMonth(userTasks)} claims this month
										</CardDescription>
									</CardHeader>
									<CardContent>
										{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
										{/* @ts-expect-error */}
										<RecentSales reports={userTasks} />
									</CardContent>
								</Card>
								<Card className="col-span-4">
									<CardHeader>
										<CardTitle>Tasks Claimed</CardTitle>
									</CardHeader>
									<CardContent className="pl-2">
										<ContractorOverview dumps={userTasks} />
									</CardContent>
								</Card>
							</div>
						</TabsContent>
						<TabsContent value="tasks" className="space-y-10">
							<h1 className="my-10 text-center text-2xl font-bold sm:text-4xl">Claimed Tasks</h1>
							<div className="mt-10 grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
								{userTasks
									.filter((report) => !report.completed)
									.map((report) => (
										<div className="flex h-72 w-[15rem] flex-col rounded-md bg-neutral-100 dark:bg-gray-800 md:h-36 md:w-[20rem] md:flex-row">
											<iframe
												src={report.location}
												className="h-1/2 w-full rounded-t-md md:h-full md:w-2/5 md:rounded-l-md"
											/>
											<div className="flex h-full w-full flex-col items-center p-3">
												<span className="line-clamp-3 text-center text-sm md:line-clamp-2 md:text-left">
													{report.description}
												</span>
												<Button
													disabled={cloading}
													onClick={(): void => completeTask(report.userId, report.id)}
													className="mt-auto w-1/2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50">
													{cloading && completeId === report.id ? (
														<BeatLoader size={8} color="#fff" />
													) : (
														"Complete"
													)}
												</Button>
											</div>
										</div>
									))}
							</div>
							<h1 className="my-10 text-center text-2xl font-bold sm:text-4xl">Unclaimed Tasks</h1>
							<div className="mt-10 grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
								{tasks.map((report) => (
									<div className="flex h-72 w-[15rem] flex-col rounded-md bg-neutral-100 dark:bg-gray-800 md:h-36 md:w-[20rem] md:flex-row">
										<iframe
											src={report.location}
											className="h-1/2 w-full rounded-t-md md:h-full md:w-2/5 md:rounded-l-md"
										/>
										<div className="flex h-full w-full flex-col items-center p-3">
											<span className="line-clamp-3 text-center text-sm md:line-clamp-2 md:text-left">
												{report.description}
											</span>
											<Button
												disabled={loading}
												onClick={(): void => claimTask(report.userId, report.id)}
												className="mt-auto w-1/2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50">
												{loading && claimId === report.id ? (
													<BeatLoader size={8} color="#fff" />
												) : (
													"Claim"
												)}
											</Button>
										</div>
									</div>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
