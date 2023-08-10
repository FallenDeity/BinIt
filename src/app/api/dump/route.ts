import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const body = (await request.json()) as {
			location: string;
			image: string;
			userId: string;
		};
		const { location, image, userId } = body;
		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const newDump = await prisma.dump.create({
			data: {
				location,
				image,
				userId,
			},
			include: {
				user: true,
			},
		});
		await pusherServer.trigger("dump", "dump:new", {
			newDump,
		});
		return NextResponse.json(newDump);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
