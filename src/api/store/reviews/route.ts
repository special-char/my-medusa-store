import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import ProductReviewService from "../../../services/product-review";
import { EntityManager } from "typeorm";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const productReviewService: ProductReviewService = req.scope.resolve(
		"productReviewService"
	);

	const manager: EntityManager = req.scope.resolve("manager");

	const productReview = await manager.transaction(
		async (transactionManager) => {
			console.log("req.body", req.body);

			return await productReviewService
				.withTransaction(transactionManager)
				.create(req.body);
		}
	);

	res.status(200).json({ productReview });
}
export async function GET(req: MedusaRequest, res: MedusaResponse) {
	const productReviewService: ProductReviewService = req.scope.resolve(
		"productReviewService"
	);
	console.log("GET REQUEST REVIEWS");

	const manager: EntityManager = req.scope.resolve("manager");

	const productReview = await manager.transaction(
		async (transactionManager) => {
			return productReviewService.withTransaction(transactionManager).find(
				{},
				{
					relations: ["customer"],
				}
			);
		}
	);

	res.status(200).json({
		productReview,
	});
}
