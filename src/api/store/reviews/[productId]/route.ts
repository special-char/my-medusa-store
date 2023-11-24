import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import ProductReviewService from "src/services/product-review";
import { EntityManager } from "typeorm";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const productReviewService: ProductReviewService = req.scope.resolve(
      "productReviewService"
    );

    const manager: EntityManager = req.scope.resolve("manager");

    const productReview = await manager.transaction(
      async (transactionManager) => {
        return await productReviewService
          .withTransaction(transactionManager)
          .retrieve(req.params.productId);
      }
    );

    res.status(200).json({
      productReview,
    });
  } catch (error) {
    res.status(500).json(error);
  }
}
