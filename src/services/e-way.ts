import {
	AbstractPaymentProcessor,
	isPaymentProcessorError,
	Logger,
	PaymentProcessorContext,
	PaymentProcessorError,
	PaymentProcessorSessionResponse,
	PaymentSessionStatus,
} from "@medusajs/medusa";
import axios, { AxiosInstance } from "axios";
// import rapid from "eway-rapid";
import { MedusaError } from "medusa-core-utils";
import { EOL } from "os";

type EWayOptions = {
	baseUrl?: string;
	key: string;
	password: string;
	endpoint: string;
	redirectUrl: string;
	cancelUrl?: string;
};

type InitiatePaymentRequestBody = {
	Customer?: {
		Reference?: string;
		Title?: string;
		FirstName: string;
		LastName: string;
		CompanyName?: string;
		JobDescription?: string;
		Street1?: string;
		Street2?: string;
		City?: string;
		State?: string;
		PostalCode?: string;
		Country?: string;
		Phone?: string;
		Mobile?: string;
		Email?: string;
	};
	ShippingAddress?: {
		ShippingMethod: string;
		FirstName: string;
		LastName: string;
		Street1: string;
		Street2: string;
		City: string;
		State: string;
		Country: string;
		PostalCode: string;
		Phone: string;
	};
	Payment: {
		TotalAmount: number;
		InvoiceNumber?: string;
		InvoiceDescription?: string;
		InvoiceReference?: string;
		CurrencyCode?: string;
	};
	RedirectUrl: string;
	CancelUrl: string;
	TransactionType: "Purchase";
	LogoUrl?: string;
	HeaderText?: string;
	Language?: string;
	Capture: boolean;
	CustomerReadOnly?: boolean;
	CustomView?: string;
	VerifyCustomerPhone?: boolean;
	VerifyCustomerEmail?: boolean;
};

class EWayService extends AbstractPaymentProcessor {
	static identifier = "e-way";

	protected readonly options_: EWayOptions;
	protected logger: Logger;
	protected client_: AxiosInstance;

	protected constructor(container: { logger: Logger }, options: EWayOptions) {
		super(container as any);

		this.logger = container.logger;
		this.options_ = {
			baseUrl:
				process.env.E_WAY_API_URL || "https://api.sandbox.ewaypayments.com",
			key: process.env.E_WAY_API_KEY,
			password: process.env.E_WAY_PASSWORD,
			endpoint: process.env.E_WAY_ENDPOINT,
			redirectUrl: process.env.E_WAY_REDIRECT_URL,
			cancelUrl: process.env.E_WAY_CANCEL_URL,
		};

		// this.client_ = rapid.createClient(
		// 	this.options_.key,
		// 	this.options_.password,
		// 	this.options_.endpoint
		// );

		this.client_ = axios.create({
			baseURL: this.options_.baseUrl,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${btoa(
					`${this.options_.key}:${this.options_.password}`
				)}`,
			},
			timeout: 30000, // Timeout after 30 seconds
		});
	}

	// Centralized Error Handling with Structured Logging
	protected buildError(
		message: string,
		e: any | PaymentProcessorError | Error
	): PaymentProcessorError {
		// Log the error for debugging and tracking
		this.logger.error(`Error: ${message}`, { error: e });

		// Handle case where the error is a PaymentProcessorError
		if (isPaymentProcessorError(e)) {
			return {
				error: message,
				code: e?.code ?? "payment_processor_error",
				detail: `${e?.error}${EOL}${e?.detail ?? ""}`,
			};
		}

		// Handle case where the error is a Stripe.StripeRawError
		if ("type" in e && "message" in e) {
			return {
				error: message,
				code: e?.code ?? "e-way error",
				detail: e?.message ?? "An error occurred with e way",
			};
		}

		// Handle case where the error is a generic Error
		if (e instanceof Error) {
			return {
				error: message,
				code: "unknown_error",
				detail: e?.message ?? "An unexpected error occurred",
			};
		}

		// Default case for unknown types of error
		return {
			error: message,
			code: "unexpected_error",
			detail: "An unexpected error occurred",
		};
	}

	// Helper function to fetch payment info and handle errors centrally
	private async fetchPaymentInfo(paymentSessionData: Record<string, unknown>) {
		const accessCode =
			(paymentSessionData?.AccessCode as string) ||
			(paymentSessionData?.accessCode as string);

		if (!accessCode) {
			throw new MedusaError(
				MedusaError.Types.UNEXPECTED_STATE,
				"AccessCode not found for payment"
			);
		}

		console.log({ accessCode });

		try {
			const response = await this.client_.get(`/Transaction/${accessCode}`);
			return response.data;
		} catch (error) {
			throw this.buildError("Error fetching payment information", error);
		}
	}

	// Creates payment page and logs relevant details
	protected async createPaymentSharedPage(context: PaymentProcessorContext) {
		try {
			const { email, customer, amount, resource_id, currency_code } = context;

			const response = await this.client_.post("/AccessCodesShared", {
				...(customer
					? {
							Customer: {
								FirstName: customer.first_name,
								LastName: customer.last_name,
								Email: email,
								Reference: customer.id,
							},
					  }
					: {}),
				Payment: {
					InvoiceReference: resource_id,
					TotalAmount: amount,
					CurrencyCode: currency_code.toUpperCase(),
				},
				RedirectUrl: this.options_.redirectUrl,
				CancelUrl: this.options_.cancelUrl || this.options_.redirectUrl,
				Language: "EN",
				TransactionType: "Purchase",
				Capture: true,
			} as InitiatePaymentRequestBody);

			if (response.status === 200) {
				const redirectURL = response.data.SharedPaymentUrl;
				const accessCode = response.data.AccessCode;
				return {
					redirectURL,
					accessCode,
					resource_id,
					amount,
					currency_code: currency_code.toUpperCase(),
					...response.data,
				};
			} else {
				throw this.buildError(
					"Error creating payment shared page",
					response.data
				);
			}
		} catch (error) {
			return this.buildError("Error creating payment shared page", error.data);
		}
	}

	// Helper function to fetch payment info and handle errors centrally
	// private async fetchPaymentInfo(paymentSessionData: Record<string, unknown>) {
	// 	const accessCode =
	// 		(paymentSessionData?.attributes as any)?.AccessCode ||
	// 		paymentSessionData?.accessCode;
	// 	if (!accessCode) {
	// 		throw new MedusaError(
	// 			MedusaError.Types.UNEXPECTED_STATE,
	// 			"AccessCode not found for payment"
	// 		);
	// 	}

	// 	try {
	// 		const response = await this.client_.queryTransaction(accessCode);
	// 		return response;
	// 	} catch (error) {
	// 		throw this.buildError("Error fetching payment information", error);
	// 	}
	// }

	// Creates payment page and logs relevant details
	// protected async createPaymentSharedPage(
	// 	context: PaymentProcessorContext
	// ): Promise<PaymentProcessorSessionResponse["session_data"]> {
	// 	try {
	// 		const { email, customer, amount, resource_id, currency_code } = context;

	// 		const response = await this.client_.createTransaction(
	// 			rapid.Enum.Method.RESPONSIVE_SHARED,
	// 			{
	// 				...(customer
	// 					? {
	// 							Customer: {
	// 								FirstName: customer.first_name,
	// 								LastName: customer.last_name,
	// 								Email: email,
	// 								Reference: customer.id,
	// 							},
	// 					  }
	// 					: {}),
	// 				Payment: {
	// 					InvoiceReference: resource_id,
	// 					TotalAmount: amount,
	// 					CurrencyCode: currency_code.toUpperCase(),
	// 				},
	// 				RedirectUrl: this.options_.redirectUrl,
	// 				CancelUrl: this.options_.cancelUrl || this.options_.redirectUrl,
	// 				Language: "EN",
	// 				TransactionType: "Purchase",
	// 				Capture: true,
	// 			} as InitiatePaymentRequestBody
	// 		);

	// 		console.dir({ response }, { depth: null });

	// 		if (response.getErrors().length === 0) {
	// 			const redirectURL = response.get("SharedPaymentUrl");
	// 			const accessCode = response.get("AccessCode");
	// 			return {
	// 				redirectURL,
	// 				accessCode,
	// 				resource_id,
	// 				amount,
	// 				currency_code: currency_code.toUpperCase(),
	// 				...response,
	// 			};
	// 		} else {
	// 			throw this.buildError("Error creating payment shared page", response);
	// 		}
	// 	} catch (error) {
	// 		throw this.buildError("Error creating payment shared page", error);
	// 	}
	// }

	// Main flow functions

	// Initiate payment
	async initiatePayment(
		context: PaymentProcessorContext
	): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
		try {
			const response = await this.createPaymentSharedPage(context);
			return {
				session_data: response,
			};
		} catch (error) {
			throw this.buildError("Error initiating payment", error);
		}
	}

	// Authorize payment
	async authorizePayment(paymentSessionData: Record<string, unknown>): Promise<
		| PaymentProcessorError
		| {
				status: PaymentSessionStatus;
				data: PaymentProcessorSessionResponse["session_data"];
		  }
	> {
		try {
			console.dir({ paymentSessionData }, { depth: null });

			const response = await this.fetchPaymentInfo(paymentSessionData);

			console.dir({ response }, { depth: null });

			return {
				status: response?.Transactions?.[0]?.TransactionStatus
					? PaymentSessionStatus.AUTHORIZED
					: PaymentSessionStatus.ERROR,
				data: { ...paymentSessionData, ...response },
			};
		} catch (error) {
			return this.buildError("Error authorizing payment", error);
		}
	}

	// Capture payment
	async capturePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		return paymentSessionData; // Simplified, adjust for actual business logic
	}

	// Get payment status
	async getPaymentStatus(
		paymentSessionData: Record<string, unknown>
	): Promise<PaymentSessionStatus> {
		try {
			const response = await this.fetchPaymentInfo(paymentSessionData);
			if (response?.attributes?.Transactions?.length) {
				return response?.attributes?.Transactions?.[0].TransactionStatus
					? PaymentSessionStatus.AUTHORIZED
					: PaymentSessionStatus.ERROR;
			} else {
				return PaymentSessionStatus.PENDING;
			}
		} catch (error) {
			throw this.buildError("Error getting payment status", error);
		}
	}

	// Retrieve payment
	async retrievePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		try {
			const accessCode = paymentSessionData.accessCode;
			if (!accessCode) {
				throw new MedusaError(
					MedusaError.Types.UNEXPECTED_STATE,
					"Access code is missing"
				);
			}
			const response = await this.fetchPaymentInfo(paymentSessionData);
			return { ...paymentSessionData, ...response };
		} catch (error) {
			throw this.buildError("Error retrieving payment", error);
		}
	}

	async updatePayment(
		context: PaymentProcessorContext
	): Promise<PaymentProcessorError | PaymentProcessorSessionResponse | void> {
		// const response = await this.createPaymentSharedPage(context);
		return {
			session_data: context.paymentSessionData,
		};
	}

	// Update payment - Simplified version
	async updatePaymentData(
		sessionId: string,
		data: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		if (data.amount || data.currency) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				"Cannot update amount, use updatePayment instead"
			);
		}
		return data; // Stub return, replace with actual logic
	}

	// Cancel payment
	async cancelPayment(
		paymentSessionData: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		try {
			const response = await this.fetchPaymentInfo(paymentSessionData);
			if (response?.attributes?.Transactions?.length) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					"Payment cannot be cancelled"
				);
			}
			return { ...paymentSessionData, ...response };
		} catch (error) {
			throw this.buildError("Error cancelling payment", error);
		}
	}

	// Delete payment
	async deletePayment(
		paymentSessionData: Record<string, unknown>
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		try {
			const response = await this.fetchPaymentInfo(paymentSessionData);
			if (response?.attributes?.Transactions?.length) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					"Payment cannot be deleted"
				);
			}
			return { ...paymentSessionData, ...response };
		} catch (error) {
			throw this.buildError("Error deleting payment", error);
		}
	}

	// Refund payment (Method not yet implemented)
	async refundPayment(
		paymentSessionData: Record<string, unknown>,
		refundAmount: number
	): Promise<
		PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
	> {
		throw new Error("Method not implemented.");
	}
}

export default EWayService;
