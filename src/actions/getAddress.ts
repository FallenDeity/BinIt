"use server";

import axios from "axios";

interface Address {
	road: string;
	house_number: string;
	postcode: string;
	city: string;
	country: string;
}

export async function getAddress(url: string): Promise<string> {
	const regex = /q=([\d.-]+),([\d.-]+)/;
	const match = url.match(regex);
	if (!match) {
		return "";
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, lat, lng] = match;
	const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
	const { data } = response as { data: { address: Address; display_name: string } };
	return data.display_name;
}
