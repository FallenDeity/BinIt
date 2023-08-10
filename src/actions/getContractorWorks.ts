"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Dump } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import getCurrentUser from "./getCurrentUser";

const getContractorWorks = async (): Promise<Dump[]> => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) {
		return [];
	}

	try {
		const dumps = await prisma.dump.findMany({
			orderBy: {
				updatedAt: "desc",
			},
			where: {
				OR: [
					{
						assignedToId: currentUser.id,
					},
					{
						completedById: currentUser.id,
					},
				],
			},
			include: {
				assignedTo: true,
				completedBy: true,
			},
		});
		return dumps;
	} catch (error) {
		console.log(error, "DUMPS_FETCH_ERROR");
		return [];
	}
};

export default getContractorWorks;
