import { 
    type SubscriberConfig, 
    type SubscriberArgs,
    OrderService,
    CustomerService,
  } from "@medusajs/medusa"
  
  export default async function customerPasswordReset({ 
    data, eventName, container, pluginOptions, 
  }: SubscriberArgs<Record<string, string>>) {
    // TODO: handle event
    console.log(data);

    console.log(eventName);
    
    
  }
  
  export const config: SubscriberConfig = {
    event: OrderService.Events.COMPLETED,
    context: {
      subscriberId: "order-confirmed",
    },
  }