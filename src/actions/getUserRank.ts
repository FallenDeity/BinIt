"use server";

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { prisma } from "@/lib/prisma";

import getCurrentUser from "./getCurrentUser";

interface Rank {
	rank: number;
	total: number;
}

const getUserRank = async (): Promise<Rank> => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) {
		return { rank: 0, total: 0 };
	}

	try {
		const total = await prisma.user.count({
			where: {
				isContractor: false,
			},
		});
		const rank = await prisma.user.count({
			where: {
				dumps: {
					some: {
						userId: currentUser.id,
					},
				},
				isContractor: false,
			},
		});
		return { rank, total };
	} catch (error) {
		console.log(error, "RANK_FETCH_ERROR");
		return { rank: 0, total: 0 };
	}
};

export default getUserRank;
