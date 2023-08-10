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

const getContractorRank = async (): Promise<Rank> => {
	const currentUser = await getCurrentUser();

	if (!currentUser?.id) {
		return { rank: 0, total: 0 };
	}

	try {
		const total = await prisma.user.count({
			where: {
				isContractor: true,
			},
		});
		const rank =
			(await prisma.user.count({
				where: {
					dumps: {
						some: {
							completedById: currentUser.id,
						},
					},
					isContractor: true,
				},
			})) || 1;
		return { rank, total };
	} catch (error) {
		console.log(error, "RANK_FETCH_ERROR");
		return { rank: 0, total: 0 };
	}
};

export default getContractorRank;
