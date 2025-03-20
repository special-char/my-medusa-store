import {
	AbstractPaymentProcessor,
	CartService,
	isPaymentProcessorError,
	PaymentProcessorContext,
	PaymentProcessorSessionResponse,
	PaymentProviderService,
	PaymentSessionStatus,
} from "@medusajs/medusa";
import axios, { AxiosInstance } from "axios";
import { MedusaError } from "medusa-core-utils";
import { EOL } from "os";

const rapid = require("eway-rapid");

interface PaymentProcessorError {
	error: string;
	code?: string;
	detail?: any;
}

interface EWayOptions {}

class EWayService {
	// static identifier = "e-way";
	protected cartService_: CartService;
	private client: AxiosInstance;

	protected paymentProviderService: PaymentProviderService;

	constructor(container, options: EWayOptions) {
		// super(container);
		console.log({ container, options });

		this.paymentProviderService = container.paymentProviderService;

		this.client = axios.create({
			baseURL: "https://api.sandbox.ewaypayments.com",
			headers: {
				// Authorization: `Basic Z2lmdG11X2Q2aDJzOTpWemtSVDkzZmZ0YmFEdG9UU0dXdkBSJFleJkteRSNeWQ==`,
				// Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString("base64")}`,
				"Content-Type": "application/json",
				// Accept: "application/json",
			},
		});
	}

	protected buildError(
		message: string,
		e: PaymentProcessorError | Error | any
	): PaymentProcessorError {
		return {
			error: message,
			code: "code" in e ? e.code : "",
			detail: isPaymentProcessorError(e)
				? `${e.error}${EOL}${e.detail ?? ""}`
				: "detail" in e
				? e.detail
				: e.message ?? "",
		};
	}

	async initiatePayment(
		context: PaymentProcessorContext
	): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
		try {
			const { amount, email, currency_code, resource_id } = context;

			console.log("Extracted context data:", {
				email,
				amount,
				currency_code,
				resource_id,
			});

			const body = {
				Payment: {
					TotalAmount: amount,
				},
				RedirectUrl: "https://gold-and-gems.vercel.app/store/diamonds",
				CancelUrl: "https://gold-and-gems.vercel.app/store/diamonds",
				Method: "ProcessPayment",
				TransactionType: "Purchase",
			};
			console.log({ body });

			const key =
				"A1001CecvcbT5xvDM4aI56gVI7wP4IGGNKBDr3BN19Ls9F5XDSQmOdrUxLh2giiCvY/evk";
			const password = "jKitQDgK";
			const endpoint = "sandbox";
			// Create the eWAY Client
			const client = rapid.createClient(key, password, endpoint);
			const res = await client.createTransaction(
				rapid.Enum.Method.RESPONSIVE_SHARED,
				body
			);
			console.log({ res });
			const body2 = await this.createInitiateData(context);
			console.log({ body2 });

			const response = await this.client.post("/orders", body);

			return {
				session_data: {
					id: response.data.id,
					order_id: response.data.id,
				},
			};
		} catch (error) {
			console.error("Error in initiatePayment:", error);
			console.dir("errorrr", error?.response?.data?.error_messages);
			return this.buildError(
				"An error occurred while initiating the payment. ",
				error
			);
		}
	}

	async capturePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<Record<string, unknown> | PaymentProcessorError> {
		console.log("capture payment", paymentSessionData);

		const paymentId = paymentSessionData.id;

		// const captureData = this.client.catch(paymentId);

		return {
			id: paymentId,
			// ...captureData,
		};
	}

	async authorizePayment(
		paymentSessionData: Record<string, unknown>,
		context: Record<string, unknown>
	): Promise<
		| PaymentProcessorError
		| {
				status: PaymentSessionStatus;
				data: Record<string, unknown>;
		  }
	> {
		console.log("Authorize payment", context, paymentSessionData);

		try {
			// await this.client.authorize(paymentSessionData.id);

			return {
				status: PaymentSessionStatus.AUTHORIZED,
				data: {
					id: paymentSessionData.id,
				},
			};
		} catch (e) {
			return {
				error: e.message,
			};
		}
	}

	async deletePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<Record<string, unknown> | PaymentProcessorError> {
		console.log("delete payment", paymentSessionData);

		const paymentId = paymentSessionData.id;

		// this.client.delete(paymentId);

		return {};
	}

	async cancelPayment(
		paymentSessionData: Record<string, unknown>
	): Promise<Record<string, unknown> | PaymentProcessorError> {
		console.log("cancel paym,ent", paymentSessionData);

		const paymentId = paymentSessionData.id;

		// const cancelData = this.client.cancel(paymentId);

		return {
			id: paymentId,
			// ...cancelData,
		};
	}

	async refundPayment(
		paymentSessionData: Record<string, unknown>,
		refundAmount: number
	): Promise<Record<string, unknown> | PaymentProcessorError> {
		console.log("refund payment", refundAmount, paymentSessionData);

		const paymentId = paymentSessionData.id;

		// const refundData = this.client.refund(paymentId, refundAmount);

		return {
			id: paymentId,
			// ...refundData,
		};
	}

	async getPaymentStatus(
		paymentSessionData: Record<string, unknown>
	): Promise<PaymentSessionStatus> {
		console.log("getpaymentstatus", paymentSessionData);

		const paymentId = paymentSessionData.id;

		// return (await this.client.getStatus(paymentId)) as PaymentSessionStatus;
		return null;
	}

	async retrievePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		console.log("retrieve payment", paymentSessionData);

		console.debug(
			"retrievePayment called with paymentSessionData:",
			paymentSessionData
		);
		try {
			const paymentId = paymentSessionData.id;
			console.log({ paymentId });
			// ...
			// return await this.client.retrieve(paymentId);
		} catch (e) {
			return this.buildError("An error occurred in retrievePayment", e);
		}
	}

	async updatePayment(
		context: PaymentProcessorContext
	): Promise<void | PaymentProcessorError | PaymentProcessorSessionResponse> {
		console.log("update payment", context);

		// assuming client is an initialized client
		// communicating with a third-party service.
		const paymentId = context.paymentSessionData.id;

		// await this.client.update(paymentId, context);

		return {
			session_data: context.paymentSessionData,
		};
	}

	async updatePaymentData(
		sessionId: string,
		data: Record<string, unknown>
	): Promise<Record<string, unknown> | PaymentProcessorError> {
		console.log("update payment", sessionId, data);

		const paymentSession = await this.paymentProviderService.retrieveSession(
			sessionId
		);
		// assuming client is an initialized client
		// communicating with a third-party service.
		// const clientPayment = await this.client.update(
		//   paymentSession.data.id,
		//   data
		// );

		return {
			id: sessionId,
			// id: clientPayment.id,
		};
	}

	// Other Methods

	async createInitiateData(context: PaymentProcessorContext): Promise<any> {
		// later give appropriate type instead of any here
		console.debug("initiatePayment called with context:", context);
		console.log("0");

		try {
			const { email, amount, currency_code, resource_id } = context;
			console.log("Extracted context data:", {
				email,
				amount,
				currency_code,
				resource_id,
			});
			console.log("1");

			// const cart = await this.cartService_.retrieve(resource_id, {
			//   relations: ["items", "billing_address"],
			// });
			// console.log("2");

			// console.log("cart in createInitiateData", cart);

			// const body = {
			//   reference_id: resource_id,
			//   customer: {
			//     name: `${cart.billing_address?.first_name} ${cart.billing_address?.last_name}`,
			//     Street1: cart.billing_address?.address_1 || "",
			//     Street2: cart.billing_address?.address_2 || "",
			//     CompanyName: cart?.billing_address?.company || "",
			//     City: cart.billing_address?.city || "",
			//     PostalCode: cart.billing_address?.postal_code || "",
			//     Country: cart.billing_address?.country || "au",
			//     email: email,
			//     tax_id:
			//       cart?.billing_address?.metadata?.cpf
			//         ?.toString()
			//         .replace(/[^0-9]/g, "") ?? "12345678909",
			//   },
			//   items: [
			//     {
			//       reference_id: "item1",
			//       name: "Order Payment",
			//       quantity: 1,
			//       unit_amount: amount,
			//     },
			//   ],
			//   notification_urls: [
			//     ...(process.env.PAGBANK_HOOK_URL
			//       ? [`${process.env.PAGBANK_HOOK_URL}/store/payment/pagbank/hook`]
			//       : []),
			//   ],
			// };

			return context;
		} catch (error) {
			console.error("Error in initiatePayment:", error);
			console.dir(error?.response?.data?.error_messages, { depth: null });

			throw new MedusaError(MedusaError.Types.NOT_FOUND, error.message);
		}
	}
}
export default EWayService;

// import { TransactionBaseService } from "@medusajs/medusa";
// import rapid from "eway-rapid";

// class EWayProviderService extends TransactionBaseService {
//   rapidAPI: any;
//   regionService: any;
//   totalsService: any;
//   paymentRepository: any;

//   static identifier = "eway";

//   constructor(container, options) {
//     super(container, options);

//     this.rapidAPI = rapid.createClient({
//       apiKey: process.env.API_KEY,
//       password: process.env.PASSWORD,
//       endpoint: process.env.ENDPOINT, // Sandbox or Live
//     });

//     this.regionService = container.resolve("regionService");
//     this.totalsService = container.resolve("totalsService");
//     this.paymentRepository = container.resolve("paymentRepository");
//   }

//   async initiatePayment(cart) {
//     try {
//       const totalAmount = await this.totalsService.getTotal(cart);

//       const paymentRequest = {
//         Payment: {
//           TotalAmount: totalAmount,
//         },
//         RedirectUrl: `${process.env.REDIRECT_URL}/${cart.id}`,
//         CancelUrl: `${process.env.CANCEL_URL}/${cart.id}`,
//       };

//       const response = await this.rapidAPI.createTransaction(paymentRequest);

//       if (response.Errors) {
//         throw new Error(`eWay Error: ${response.Errors}`);
//       }

//       return {
//         id: response.TransactionID,
//         redirectUrl: response.SharedPaymentUrl,
//       };
//     } catch (error) {
//       throw new Error(`Payment initiation failed: ${error.message}`);
//     }
//   }

//   async retrievePayment(paymentId) {
//     try {
//       const response = await this.rapidAPI.getTransaction(paymentId);
//       return response;
//     } catch (error) {
//       throw new Error(`Error retrieving payment: ${error.message}`);
//     }
//   }
// }

// export default EWayProviderService;
