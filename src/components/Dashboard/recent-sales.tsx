import { Dump, User } from "@prisma/client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FullDump extends Dump {
	assignedTo: User | null;
}

export function RecentSales({ reports }: { reports: FullDump[] }): React.JSX.Element {
	let assignedReports = reports.filter((report) => report.assignedTo !== null && !report.completed);
	const thisMonth = new Date().getMonth();
	assignedReports = assignedReports.filter((report) => {
		const reportMonth = new Date(report.createdAt).getMonth();
		return reportMonth === thisMonth;
	});
	return (
		<div className="space-y-8">
			{assignedReports.slice(0, 6).map((report) => (
				<div className="flex items-center">
					<Avatar className="h-9 w-9">
						<AvatarImage src={String(report.assignedTo?.image)} alt="Avatar" />
						<AvatarFallback className="bg-rose-500">
							{report.assignedTo?.name?.slice(0, 2).toLocaleUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="ml-4 space-y-1">
						<a
							href={report.location.replace("&output=embed", "")}
							className="text-sm font-medium leading-none transition-all duration-300 ease-in-out hover:text-blue-500">
							{report.assignedTo?.name}
						</a>
						<p className="hidden w-[250px] truncate text-sm text-muted-foreground sm:flex">
							{report.description}
						</p>
					</div>
					{/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
					<div className={`ml-auto text-red-600 sm:font-medium ${report.completed && "text-green-600"}`}>
						{report.completed ? "Completed" : "Pending"}
					</div>
				</div>
			))}
		</div>
	);
}
