import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>): React.JSX.Element {
	return (
		<nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
			<Link href="/home" className="flex items-center text-lg font-medium transition-colors hover:text-primary">
				<Image src="/logo.png" alt="Logo" width="22" height="22" className="mr-3 text-primary" priority />
				BinIt.
			</Link>
		</nav>
	);
}
