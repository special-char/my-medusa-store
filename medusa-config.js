const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
	case "production":
		ENV_FILE_NAME = ".env.production";
		break;
	case "staging":
		ENV_FILE_NAME = ".env.staging";
		break;
	case "test":
		ENV_FILE_NAME = ".env.test";
		break;
	case "development":
	default:
		ENV_FILE_NAME = ".env";
		break;
}

try {
	dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
	process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
	process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://62.72.13.4:6379";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:9000";
const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:7001";
const STORE_URL = process.env.STORE_URL || "http://localhost:3000";

const GoogleClientId = process.env.GOOGLE_CLIENT_ID || "";
const GoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const FacebookClientId = process.env.FACEBOOK_CLIENT_ID || "";
const FacebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || "";

const plugins = [
	`medusa-fulfillment-manual`,
	`medusa-payment-manual`,
	{
		resolve: "@medusajs/admin",
		/** @type {import('@medusajs/admin').PluginOptions} */
		options: {
			autoRebuild: true,
			develop: {
				open: process.env.OPEN_BROWSER !== "false",
			},
		},
	},
	{
		resolve: `medusa-file-s3`,
		options: {
			s3_url: process.env.S3_URL,
			bucket: process.env.S3_BUCKET,
			region: process.env.S3_REGION,
			access_key_id: process.env.S3_ACCESS_KEY_ID,
			secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
			cache_control: process.env.S3_CACHE_CONTROL,
		},
	},
	// {
	//   resolve: `medusa-payment-phonepe`,
	//   options: {
	//     redirectUrl: `http://localhost:3000/api/payment-confirmed`,
	//     callbackUrl: `http://localhost:9000/phonepe/hook`,
	//     salt: process.env.PHONEPE_SALT,
	//     merchantId: process.env.PHONEPE_MERCHANT_ACCOUNT,
	//     mode: process.env.PHONEPE_MODE,
	//     redirectMode: process.env.PHONEPE_REDIRECT_MODE,
	//   },
	// },
	{
		resolve: `medusa-plugin-meilisearch`,
		options: {
			// config object passed when creating an instance of the MeiliSearch client
			config: {
				host: process.env.MEILISEARCH_HOST,
				apiKey: process.env.MEILISEARCH_API_KEY,
			},
			settings: {
				products: {
					// MeiliSearch's setting options to be set on a particular index
					searchableAttributes: ["title", "description", "variant_sku"],
					displayedAttributes: [
						"title",
						"description",
						"variant_sku",
						"thumbnail",
						"handle",
					],
					transformer: (product) => ({
						id: product.id,
						title: product.title,
						description: product.description,
						variant_sku: product.variant_sku,
						thumbnail: product.thumbnail,
						handle: product.handle,
						// other attributes...
					}),
				},
			},
		},
	},
	// {
	//   resolve: `medusa-payment-razorpay`,
	//   options: {
	//     key_id: process.env.RAZORPAY_ID,
	//     key_secret: process.env.RAZORPAY_SECRET,
	//     razorpay_account: process.env.RAZORPAY_ACCOUNT,
	//     automatic_expiry_period: 30 /*any value between 12minuts and 30 days expressed in minutes*/,
	//     manual_expiry_period: 20,
	//     refund_speed: "normal",
	//     webhook_secret: process.env.RAZORPAY_SECRET,
	//   },
	// },
	{
		resolve: "medusa-plugin-auth",
		/** @type {import('medusa-plugin-auth').AuthOptions} */
		options: [
			{
				type: "google",
				// strict: "all", // or "none" or "store" or "admin"
				strict: "none",
				identifier: "google",
				clientID: GoogleClientId,
				clientSecret: GoogleClientSecret,
				admin: {
					callbackUrl: `${BACKEND_URL}/admin/auth/google/cb`,
					failureRedirect: `${ADMIN_URL}/login`,
					// The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
					// This query param will have the priority over this configuration
					successRedirect: `${ADMIN_URL}/`,
					// authPath: '/admin/auth/google',
					// authCallbackPath: '/admin/auth/google/cb',
					// expiresIn: 24 * 60 * 60 * 1000,
					// verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
					//    // implement your custom verify callback here if you need it
					// },
				},
				store: {
					callbackUrl: `${BACKEND_URL}/store/auth/google/cb`,
					failureRedirect: `${STORE_URL}/login`,
					// The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
					// This query param will have the priority over this configuration
					successRedirect: `${STORE_URL}/`,
					// authPath: '/store/auth/google',
					// authCallbackPath: '/store/auth/google/cb',
					// expiresIn: 24 * 60 * 60 * 1000,
					// verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
					//    // implement your custom verify callback here if you need it
					// },
				},
			},
			{
				type: "facebook",
				// strict: "all", // or "none" or "store" or "admin"
				strict: "none",
				identifier: "facebook",
				clientID: FacebookClientId,
				clientSecret: FacebookClientSecret,
				admin: {
					callbackUrl: `${BACKEND_URL}/admin/auth/facebook/cb`,
					failureRedirect: `${ADMIN_URL}/login`,
					// The success redirect can be overridden from the client by adding a query param `?redirectTo=your_url` to the auth url
					// This query param will have the priority over this configuration
					successRedirect: `${ADMIN_URL}/`,
					// authPath: '/admin/auth/facebook',
					// authCallbackPath: '/admin/auth/facebook/cb',
					// expiresIn: 24 * 60 * 60 * 1000,
					// verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
					//    // implement your custom verify callback here if you need it
					// }
				},
				store: {
					callbackUrl: `${BACKEND_URL}/store/auth/facebook/cb`,
					failureRedirect: `${STORE_URL}/login`,
					// The success redirect can be overridden from the client by adding a query param `?redirectTo=your_url` to the auth url
					// This query param will have the priority over this configuration
					successRedirect: `${STORE_URL}/`,
					// authPath: '/store/auth/facebook',
					// authCallbackPath: '/store/auth/facebook/cb',
					// expiresIn: 24 * 60 * 60 * 1000,
					// verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
					//    // implement your custom verify callback here if you need it
					// }
				},
			},
		],
	},
];

const modules = {
	eventBus: {
		resolve: "@medusajs/event-bus-redis",
		options: {
			redisUrl: REDIS_URL,
		},
	},
	// cacheService: {
	//   resolve: "@medusajs/cache-redis",
	//   options: {
	//     redisUrl: REDIS_URL,
	//     ttl: 30,
	//   },
	// },
	inventoryService: {
		resolve: "@medusajs/inventory",
	},
	stockLocationService: {
		resolve: "@medusajs/stock-location",
	},
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
	jwtSecret: process.env.JWT_SECRET,
	cookieSecret: process.env.COOKIE_SECRET,
	store_cors: STORE_CORS,
	database_url: DATABASE_URL,
	admin_cors: ADMIN_CORS,
	// Uncomment the following lines to enable REDIS
	// redis_url: REDIS_URL,
	database_extra:
		process.env.NODE_ENV !== "development"
			? {
					ssl: {
						rejectUnauthorized: false,
					},
			  }
			: {},
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
	projectConfig,
	plugins,
	modules,
	featureFlags: {
		product_categories: true,
		sales_channels: true,
		publishable_api_keys: true,
		tax_inclusive_pricing: true,
	},
};
