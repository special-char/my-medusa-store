import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { Router } from "express";
import EWayService from "src/services/e-way";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const ewayService: EWayService = req.scope.resolve("eWayService");
  try {
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({ error: "cart_id is required" });
    }

    const cartService = req.scope.resolve("cartService");
    const paymentProviderService = req.scope.resolve("eWayService");

    const cart = await cartService.retrieve(cart_id, {
      relations: ["items"],
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const paymentSession = await paymentProviderService.initiatePayment(
      "e-way",
      cart
    );

    if (!paymentSession || !paymentSession.data) {
      return res
        .status(500)
        .json({ error: "Failed to create payment session" });
    }

    return res.status(200).json({
      success: true,
      payment_url: paymentSession.data.redirect_url, // Ensure `redirect_url` is returned from eWay
      session_id: paymentSession.id,
    });
  } catch (error) {
    console.error("Error initiating eWay payment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default (rootDirectory) => {
  const router = Router();

  router.post("/eway/initiate", async (req, res) => {
    try {
      const { cart_id } = req.body;

      if (!cart_id) {
        return res.status(400).json({ error: "cart_id is required" });
      }

      const cartService = req.scope.resolve("cartService");
      const paymentProviderService = req.scope.resolve(
        "paymentProviderService"
      );

      const cart = await cartService.retrieve(cart_id, {
        relations: ["items"],
      });

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      const paymentSession = await paymentProviderService.createSession(
        "e-way",
        cart
      );

      if (!paymentSession || !paymentSession.data) {
        return res
          .status(500)
          .json({ error: "Failed to create payment session" });
      }

      return res.status(200).json({
        success: true,
        payment_url: paymentSession.data.redirect_url, // Ensure `redirect_url` is returned from eWay
        session_id: paymentSession.id,
      });
    } catch (error) {
      console.error("Error initiating eWay payment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
