import { Metadata } from "next";
import React from "react";

import { meta } from "@/lib/utils";

import Board from "./components/Board";

export const metadata: Metadata = meta;

export default function DashboardPage(): React.JSX.Element {
	return (
		<>
			<Board />
		</>
	);
}
