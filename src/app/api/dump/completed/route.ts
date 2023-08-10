import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const body = (await request.json()) as {
			dumpId: string;
			userId: string;
			assignedToId: string;
		};
		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const updatedDump = await prisma.dump.update({
			where: {
				id: body.dumpId,
			},
			data: {
				updatedAt: new Date(),
				completed: true,
				completedBy: {
					connect: {
						id: body.assignedToId,
					},
				},
			},
		});
		await pusherServer.trigger(body.userId, "dump:update", {
			updatedDump,
		});
		await pusherServer.trigger(body.assignedToId, "dump:update", {
			updatedDump,
		});
		return NextResponse.json(updatedDump);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
