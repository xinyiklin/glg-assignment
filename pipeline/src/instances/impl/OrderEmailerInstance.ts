import { promises as fs } from "fs";

import { QueueInstance } from "../classes/QueueInstance";
import { OrderMessage } from "../../definitions/messages/OrderMessage";
import { OrdersDatabase } from "../../databases/OrdersDatabase";
import { OrderStatus } from "../../definitions/enums/OrderStatus";
import { EmailService } from "../../services/email/EmailService";

const { SQS_ORDER_EMAIL_QUEUE_NAME } = process.env;

export class OrderEmailerInstance extends QueueInstance<OrderMessage> {
  constructor() {
    super({ loggerPrefix: "OrderEmailerInstance", queueName: SQS_ORDER_EMAIL_QUEUE_NAME });
  }

  protected getRequiredMessageFields(): Array<keyof OrderMessage> {
    return ["orderId"];
  }

  /**
   * Email the customer with the order details and receipt.
   * @param message
   * @protected
   */
  protected async process({ orderId, kind }: OrderMessage): Promise<void> {
    const order = await OrdersDatabase.getOrderById(orderId);

    if (!order) throw new Error(`Order not found: ${orderId}`);

    if (kind === "cancellation") {
      if (order.status !== OrderStatus.CANCELLED) {
        this.logger.warn(`Order ${orderId} is not cancelled`);
        return;
      }
      if (!order.details?.customer?.email) {
        this.logger.warn(`Order ${orderId} has no customer email for cancellation`);
        return;
      }
      await EmailService.sendCancellationEmail({ order });
      this.logger.info(`Cancellation email sent for order ${orderId}`);
      return;
    }

    if (order.status !== OrderStatus.PROCESSING) {
      if (order.status === OrderStatus.CANCELLED && order.receiptFilePath) {
        await fs.unlink(order.receiptFilePath).catch((error: any) => {
          if (error?.code !== "ENOENT") throw error;
        });
      }
      this.logger.warn(`Order ${orderId} is not in PROCESSING state`);
      return;
    }

    if (!order.receiptFilePath) {
      this.logger.warn(`Order ${orderId} does not have a receipt file path`);
      return;
    }

    // Read the receipt file into a buffer
    const receipt = await fs.readFile(order.receiptFilePath);
    const admitted = await OrdersDatabase.updateIfStatus(order.orderId, OrderStatus.PROCESSING, {});
    if (!admitted) {
      await fs.unlink(order.receiptFilePath).catch((error: any) => {
        if (error?.code !== "ENOENT") throw error;
      });
      this.logger.warn(`Order ${orderId} was cancelled before receipt email`);
      return;
    }

    await EmailService.sendEmail({
      order,
      receipt,
    });

    this.logger.info(`Order ${orderId} email sent`);

    const completed = await OrdersDatabase.updateIfStatus(order.orderId, OrderStatus.PROCESSING, { status: OrderStatus.COMPLETED, completedAt: Date.now() });
    await fs.unlink(order.receiptFilePath).catch((error: any) => {
      if (error?.code !== "ENOENT") throw error;
    });
    
    this.logger.info(`Order ${orderId} status ${completed ? "updated" : "preserved after cancellation"}`);
  }
}
