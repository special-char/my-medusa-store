import {
  AbstractFulfillmentService,
  Cart,
  Fulfillment,
  LineItem,
  Order,
  OrderService,
  ProductVariantInventoryService,
} from "@medusajs/medusa";
import { StockLocationService } from "@medusajs/stock-location/dist/services";
import { Lifetime } from "awilix";

// import { StockLocationService } from '@medusajs/stock-location/dist/services';
import { CreateReturnType } from "@medusajs/medusa/dist/types/fulfillment-provider";
import axios, { AxiosInstance } from "axios";

class DelhiveryFulfillmentService extends AbstractFulfillmentService {
  static identifier = "delhivery";
  static LIFE_TIME = Lifetime.SCOPED;
  private axiosInstance_: AxiosInstance;
  private options_: any;
  productVariantInventoryService_: ProductVariantInventoryService;
  orderService_: OrderService;
  stockLocationService_: StockLocationService;

  constructor(container, config?: Record<string, unknown>) {
    super(container);

    const {
      orderService,
      productVariantInventoryService,
      stockLocationService,
    } = container;

    try {
      this.productVariantInventoryService_ = productVariantInventoryService;
      this.stockLocationService_ = stockLocationService;
    } catch (error) {
      console.log(
        "DELHIVERY:::::::::::::::",
        "productVariantInventoryService_",
        error
      );
    }

    // /** @private @const {OrderService} */
    this.orderService_ = orderService;

    // /** @private @const {TotalsService} */
    // this.totalsService_ = container.resolve<TotalsService>("totalsService");

    // /** @private @const {SwapService} */
    // this.swapService_ = container.resolve<SwapService>("swapService");

    // /** @private @const {SwapService} */
    // this.claimService_ = container.resolve<ClaimService>("claimService");
    // you can access options here
    this.axiosInstance_ = axios.create({
      baseURL: `https://${process.env.DELHIVERY_MODE}.delhivery.com`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
      },
    });
  }

  async getFulfillmentOptions(): Promise<any[]> {
    return [
      {
        id: "delhivery-surface",
      },
      {
        id: "delhivery-express",
      },
    ];
  }
  // COMPLETED
  async validateFulfillmentData(
    optionData: { [x: string]: string },
    data: { [x: string]: unknown },
    cart: Cart
  ): Promise<Record<string, unknown>> {
    if (
      ["delhivery-surface", "delhivery-express"].indexOf(optionData.id) === -1
    ) {
      throw new Error("invalid data");
    }

    if (cart?.shipping_address?.postal_code) {
      const res = await this.axiosInstance_.get(
        `c/api/pin-codes/json/?filter_codes=${cart?.shipping_address?.postal_code}`
      );
      if (res.data?.delivery_codes?.length === 0) {
        throw new Error("delhivery not possible on this pincode data");
      }
      console.log({ response: JSON.stringify(res.data) });
    }
    return {
      ...optionData,
      ...data,
    };
  }
  // COMPLETED
  async validateOption(data: { [x: string]: unknown }): Promise<boolean> {
    console.log("DELHIVERY:::::::::::::::validateOption", data);
    return true;
  }
  // COMPLETED
  async canCalculate(data: { [x: string]: unknown }): Promise<boolean> {
    console.log("DELHIVERY:::::::::::::::canCalculate", data);
    return data.id == "delhivery-surface" || data.id == "delhivery-express";
  }
  // COMPLETED
  async calculatePrice(
    optionData: { [x: string]: unknown },
    data: { [x: string]: unknown },
    cart: Cart
  ): Promise<number> {
    console.log("DELHIVERY:::::::::::::::calculatePrice", {
      data,
      optionData,
      cart,
    });
    // const inventory = await this.stockLocationService_.list(
    //   {},
    //   {
    //     relations: ["address"],
    //   }
    // );

    // const weight = cart.items.reduce((p, c) => {
    //   return p + c.variant.weight * c.quantity;
    // }, 0);

    // const md = data.id === "delhivery-express" ? "E" : "S";

    // const res = await this.axiosInstance_.get(
    //   `api/kinko/v1/invoice/charges/.json?md=${md}&ss=DTO&d_pin=${cart.shipping_address.postal_code}&o_pin=${inventory[0].address.postal_code}&cgm=${weight}&pt=Pre-paid&cod=0`
    // );

    return 0;
    // res?.data[0]?.total_amount || 0;
  }

  // COMPLETED
  async createFulfillment(
    data: Record<string, unknown>,
    items: LineItem[],
    order: Order,
    fulfillment: Fulfillment
  ): Promise<Record<string, unknown>> {
    try {
      // console.log({
      //   shipments: [
      //     {
      //       order: "INSERT ORDER NUMBER HERE",
      //       waybill: "",
      //       add: "TEST",
      //       name: "TEST",
      //       phone: "+9988776655",
      //       pin: "500081",
      //       payment_mode: "Pickup/COD",
      //       cod_amount: "COD AMOUNT IN CASE OF COD",
      //       shipping_mode: "Express/Surface",
      //       products_desc: "SKU1, SKU2, SKU3",
      //       quantity: "INSERT QUNATITY HERE",
      //     },
      //   ],
      //   pickup_location: {
      //     name: "INSERT WAREHOUSE/PICKUP LOCATION NAME HERE",
      //   },
      // });
      const locationDetails = await this.stockLocationService_.retrieve(
        fulfillment.location_id,
        {
          relations: ["address"],
        }
      );
      console.log("DELHIVERY:::::::::::::::createFulfillment", {
        payload: JSON.stringify({
          order,
        }),
      });
      order.payments[0].provider_id;
      const shipmentData = {
        shipments:[
          {
            order: order.id,
            waybill: "",
            add: order.billing_address,
            name: `${order?.shipping_address?.first_name} ${order?.shipping_address?.last_name}`,
            phone: order?.shipping_address?.phone,
            pin: order?.shipping_address?.postal_code,
            payment_mode: order.payments[0].provider_id === "cod" ? "COD" : "Prepaid",
            cod_amount: order.total,
            shipping_mode: "Express",
            products_desc: items.map(x=>x.variant.sku).filter(x=>x).join(","),
            quantity: items.map(x=>x.quantity).reduce((p,c)=>p+c,0),
          },
        ]
        // shipments: items.map((x) => ({
        //   name: `${order?.shipping_address?.first_name} ${order?.shipping_address?.last_name}`,
        //   add:
        //     `${order?.shipping_address?.address_1} ${order?.shipping_address?.address_2}` ||
        //     "8 ganeshkunj",
        //   pin: order?.shipping_address?.postal_code,
        //   city: order?.shipping_address?.city || "ahmedabad",
        //   product_desc:"",
        //   state: order?.shipping_address?.province,
        //   country: order?.shipping_address?.country || "India",
        //   phone: order?.shipping_address?.phone,
        //   order: order?.id,
        //   payment_mode:
        //     order.payments[0].provider_id === "cod" ? "COD" : "Prepaid",
        //   return_pin: locationDetails.address.postal_code,
        //   return_city: locationDetails.address.city,
        //   return_phone: locationDetails.address.phone,
        //   return_add: `${locationDetails.address.address_1} ${locationDetails.address.address_2}`,
        //   return_state: locationDetails.address.province,
        //   return_country: locationDetails.address.country_code,
        //   products_desc: x.description,
        //   hsn_code: x.variant.hs_code,
        //   cod_amount: order.total,
        //   order_date: order.created_at,
        //   total_amount: order.total,
        //   seller_add: `${locationDetails.address.address_1} ${locationDetails.address.address_2}`,
        //   seller_name: locationDetails.address.company,
        //   seller_inv: "",
        //   quantity: x.quantity,
        //   waybill: "",
        //   shipment_width: x.variant.width,
        //   shipment_height: x.variant.height,
        //   weight: x.variant.weight,
        //   seller_gst_tin: "",
        //   shipping_mode: "Express",
        //   address_type: "home",
        // })),
        pickup_location: {
          name: locationDetails.name,
          add: `${locationDetails.address.address_1} ${locationDetails.address.address_2}`,
          city: locationDetails.address.city,
          pin_code: locationDetails.address.postal_code,
          country: locationDetails.address.country_code,
          phone: locationDetails.address.phone || 9986993600,
        },
      };

      const res = await fetch(
        `https://${process.env.DELHIVERY_MODE}.delhivery.com/api/cmu/create.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
          },
          body: `format=json&data=${JSON.stringify(shipmentData)}`,
        }
      );

      const json = await res.json();

      if (!json.success) {
        let messages = json.rmk;

        if (json.packages.length > 0) {
          messages = json.packages
            .reduce((p, c) => {
              return [...p, ...c.remarks];
            }, [])
            .join(",");
        }

        throw new Error(messages);
      }
      console.log("json", JSON.stringify(json));

      return json;
    } catch (error) {
      console.error({ error });
    }
  }

  // COMPLETED
  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    console.log("DELHIVERY:::::::::::::::cancelFulfillment", {
      cancelFulfillment: fulfillment?.packages,
    });
    const res = await this.axiosInstance_.post(`/api/p/edit`, {
      // waybill generated from creating shipment
      waybill:
        // @ts-ignore
        fulfillment?.packages?.length > 0
          ? fulfillment?.packages[0]?.waybill
          : "",
      cancellation: true,
    });
    console.log("DELHIVERY:::::::::::::::cancelFulfillment", {
      data: JSON.stringify(res.data),
    });
    return {};
  }
  // COMPLETED

  async createReturn(
    returnOrder: CreateReturnType
  ): Promise<Record<string, unknown>> {
    try {
      const order = await this.orderService_.retrieve(returnOrder.order_id, {
        relations: [
          "shipping_address",
          "billing_address",
          "region",
          "payments",
          "cart.items",
        ],
      });

      const locationDetails = await this.stockLocationService_.retrieve(
        returnOrder.location_id,
        {
          relations: ["address"],
        }
      );
      console.log("DELHIVERY:::::::::::::::createFulfillment", {
        payload: JSON.stringify({
          returnOrder,
        }),
      });
      const shipmentData = {
        shipments: returnOrder.items.map((x) => ({
          name: `${order.shipping_address?.first_name} ${order.shipping_address?.last_name}`,
          add: `${order.shipping_address?.address_1} ${order.shipping_address?.address_2}`,
          pin: order.shipping_address?.postal_code,
          city: order.shipping_address?.city,
          state: order.shipping_address?.province,
          country: order.shipping_address?.country,
          phone: order.shipping_address?.phone || "9999999999",
          order: order.id,
          payment_mode:
            order.payments[0]?.provider_id === "cod" ? "COD" : "Prepaid",
          return_pin: locationDetails?.address?.postal_code,
          return_city: locationDetails?.address?.city,
          return_phone: locationDetails?.address?.phone,
          return_add: `${locationDetails?.address?.address_1} ${locationDetails?.address?.address_2}`,
          return_state: locationDetails?.address?.province,
          return_country: locationDetails?.address?.country_code,
          products_desc: x?.item?.description,
          hsn_code: x?.item?.variant?.hs_code,
          ...(order.payments[0]?.provider_id === "cod" && {
            cod_amount: returnOrder.refund_amount || "10",
          }),
          order_date: order.created_at,
          total_amount: returnOrder.refund_amount,
          seller_add: `${locationDetails?.address?.address_1} ${locationDetails?.address?.address_2}`,
          seller_name: locationDetails?.address?.company,
          seller_inv: "",
          quantity: x?.quantity,
          waybill: "",
          shipment_width: x?.item?.variant?.width,
          shipment_height: x?.item?.variant?.height,
          weight: x?.item?.variant?.weight,
          seller_gst_tin: "",
          shipping_mode: "Surface",
          address_type: "home",
        })),
        pickup_location: {
          name: locationDetails?.name,
          add: `${locationDetails?.address?.address_1} ${locationDetails?.address?.address_2}`,
          city: locationDetails?.address?.city,
          pin_code: locationDetails?.address?.postal_code,
          country: locationDetails?.address?.country_code,
          phone: locationDetails?.address?.phone || "9999999999",
        },
      };
      console.log({ shipmentData: JSON.stringify(shipmentData) });

      const res = await fetch(
        `https://${process.env.DELHIVERY_MODE}.delhivery.com/api/cmu/create.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
          },
          body: `format=json&data=${JSON.stringify(shipmentData)}`,
        }
      );

      const json = await res.json();

      if (!json.success) {
        let messages = json.rmk;

        if (json.packages.length > 0) {
          messages = json.packages
            ?.reduce((p, c) => {
              return [...p, ...c.remarks];
            }, [])
            .join(",");
        }

        throw new Error(messages);
      }
      console.log("json", JSON.stringify(json));
      return json;
    } catch (error) {
      console.error({ error });
    }
  }
  // TODO >
  async getFulfillmentDocuments(data: Record<string, unknown>): Promise<any> {
    console.log("DELHIVERY:::::::::::::::getFulfillmentDocuments", {
      getFulfillmentDocuments: data,
    });
    const res = await this.axiosInstance_.get(
      `/api/p/packing_slip?wbns=5645010000210&pdf=true`
    );
    console.log("DELHIVERY:::::::::::::::getFulfillmentDocuments", {
      data: res.data,
    });
    // throw new Error("Method not implemented.");
    // return Promise.resolve({});
    // return []
  }

  async getReturnDocuments(data: Record<string, unknown>): Promise<any> {
    console.log("DELHIVERY:::::::::::::::getReturnDocuments", { data });

    throw new Error("Method not implemented.");
    // return Promise.resolve({});
  }

  async getShipmentDocuments(data: Record<string, unknown>): Promise<any> {
    console.log("DELHIVERY:::::::::::::::getShipmentDocuments", { data });

    throw new Error("Method not implemented.");
    // return Promise.resolve({});
  }

  async retrieveDocuments(
    fulfillmentData: Record<string, unknown>,
    documentType: "invoice" | "label"
  ): Promise<any> {
    console.log("DELHIVERY:::::::::::::::retrieveDocuments", {
      fulfillmentData,
      documentType,
    });
    return Promise.resolve({});
    // throw new Error("Method not implemented.");
  }
}

export default DelhiveryFulfillmentService;
