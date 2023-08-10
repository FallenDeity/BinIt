"use client";

import { Dump } from "@prisma/client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

let data = [
	{
		name: "Mon",
		total: 0,
	},
	{
		name: "Tue",
		total: 0,
	},
	{
		name: "Wed",
		total: 0,
	},
	{
		name: "Thu",
		total: 0,
	},
	{
		name: "Fri",
		total: 0,
	},
	{
		name: "Sat",
		total: 0,
	},
	{
		name: "Sun",
		total: 0,
	},
];

export function ContractorOverview({ dumps }: { dumps: Dump[] }): React.JSX.Element {
	console.log(dumps);
	if (dumps.length) {
		const today = new Date();
		const day = today.getDay();
		const week = [];
		for (let i = 0; i < 7; i++) {
			week.push(today.getDate() - day + i);
		}
		const new_week = week.slice(day + 1).concat(week.slice(0, day + 1));
		const weekDates = new_week.map((day) => new Date(today.setDate(day)));
		const dumpCount = weekDates.map(
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			(day) => dumps.filter((dump) => new Date(dump.updatedAt).getDate() === day.getDate()).length
		);
		data = weekDates.map((day, index) => ({
			name: day.toLocaleString("default", { weekday: "short" }),
			total: dumpCount[index],
		}));
	}
	console.log(data);
	return (
		<ResponsiveContainer width="100%" height={350}>
			<BarChart data={data}>
				<XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
				<YAxis
					stroke="#888888"
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value): string => `${String(value)}`}
				/>
				<Bar dataKey="total" fill="#5a16e2" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}
