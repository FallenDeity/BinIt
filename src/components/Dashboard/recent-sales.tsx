import { Dump, User } from "@prisma/client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FullDump extends Dump {
	assignedTo: User | null;
}

export function RecentSales({ reports }: { reports: FullDump[] }): React.JSX.Element {
	let assignedReports = reports.filter((report) => report.assignedTo !== null);
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
						<AvatarImage src="/avatars/01.png" alt="Avatar" />
						<AvatarFallback>{report.assignedTo?.name}</AvatarFallback>
					</Avatar>
					<div className="ml-4 space-y-1">
						<p className="text-sm font-medium leading-none">{report.assignedTo?.name}</p>
						<p className="hidden text-sm text-muted-foreground sm:flex">{report.assignedTo?.email}</p>
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
