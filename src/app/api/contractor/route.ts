import { NextResponse } from "next/server";

import getCurrentUser from "@/actions/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const currentUser = await getCurrentUser();
		const body = (await request.json()) as {
			userId: string;
		};
		if (!currentUser?.id || !currentUser.email) {
			return new NextResponse("Unauthorized", { status: 401 });
		}
		const updateUser = await prisma.user.update({
			where: {
				id: body.userId,
			},
			data: {
				isContractor: true,
			},
		});
		await pusherServer.trigger(currentUser.id, "user:update", {
			updateUser,
		});
		return NextResponse.json(updateUser);
	} catch (error) {
		console.log(error, "ERROR_MESSAGES");
		return new NextResponse("Error", { status: 500 });
	}
}
