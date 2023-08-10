import { Metadata } from "next";

import Hero from "@/components/Hero";
import { meta } from "@/lib/utils";

export const metadata: Metadata = meta;

export default function HomePage(): React.JSX.Element {
	return (
		<>
			<Hero />
		</>
	);
}
