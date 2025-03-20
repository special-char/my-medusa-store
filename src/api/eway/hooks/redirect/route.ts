import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse
): Promise<void> {
	console.log("GET Event called with data");

	try {
		console.log({ query: req.query });
		console.log({ accessCode: req.query.accessCode });
	} catch (err) {}
	res.sendStatus(200);
}

export async function POST(
	req: MedusaRequest,
	res: MedusaResponse
): Promise<void> {
	console.log("POST Event called with data");

	try {
		console.log({ query: req.query });
		console.log({ body: req.body });
		console.log({ accessCode: req.query.accessCode });
	} catch (err) {}
	res.sendStatus(200);
}
