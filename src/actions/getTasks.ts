"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Dump } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import getCurrentUser from "./getCurrentUser";

const getTasks = async (): Promise<Dump[]> => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) {
		return [];
	}

	try {
		// dumps where assignedToId is null or does not exist
		let dumps = await prisma.dump.findMany({
			include: {
				assignedTo: true,
				completedBy: true,
			},
		});
		dumps = dumps.filter((dump) => dump.assignedToId === null);
		return dumps;
	} catch (error) {
		console.log(error, "DUMPS_FETCH_ERROR");
		return [];
	}
};

export default getTasks;
