import { Lifetime } from "awilix"
import { 
  ProductService as MedusaProductService,
} from "@medusajs/medusa"

class ProductService extends MedusaProductService {
  // The default life time for a core service is SINGLETON
  static LIFE_TIME = Lifetime.SCOPED


  // ...
}

export default ProductService