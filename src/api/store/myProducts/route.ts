import {
  DiscountService,
  MedusaRequest,
  MedusaResponse,
  ProductCategory,
  ProductService,
} from "@medusajs/medusa";
import {
  FindProductConfig,
  ProductSelector,
} from "@medusajs/medusa/dist/types/product";
import {
  EntityManager,
  Between,
  And,
  Equal,
  In,
  Any,
  ArrayContains,
} from "typeorm";
import { DAL } from "@medusajs/types";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService: ProductService = req.scope.resolve("productService");

  const manager: EntityManager = req.scope.resolve("manager");
  const products = await manager.transaction(async (transactionManager) => {
    const category_id = req.query?.category_id;
    let filters = {
      //   title: Like("%Flashcards%"),
      // category_id,
    };

    const config: FindProductConfig = {
      relations: [
        "categories",
        // "collection",
        // "images",
        // "options",
        "variants",
        "variants.prices",
      ],
    };
    // "items.product";
    const to = req.query.lte;
    const from = req.query.gte || 0;
    const order = req.query.order;
    console.log("====================================");
    console.log(category_id);
    console.log("====================================");

    const products = await ProductRepository.find({
      relations: [
        "categories",
        // "collection",
        // "images",
        // "options",
        "variants",
        "variants.prices",
      ],
      //@ts-ignore
      where: {
        categories: {
          // Using the ANY operator to check if both category IDs are in the array
          // $all: ['pcat_01HDGAWHWEHNWDBMS3K0SSJ0RY', 'pcat_01HDGAQ2W6Q0S6VCERXM4BQW91'],
        },
        ...(order && { order }),
        
      },
    });
    console.log(products.length);

    const response = await productService
      .withTransaction(transactionManager)
      .list(filters, config);

    return products;
  });

  res.status(200).json({ products });
}
