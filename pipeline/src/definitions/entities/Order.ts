import { OrderStatus } from "../enums/OrderStatus";
import { OrderDetails } from "./OrderDetails";

export interface Order {
  orderId: string;
  userId: string;
  amount: number;
  referenceId: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  cancelledAt?: number;
  receiptFilePath?: string;
  details?: OrderDetails;
  completedAt?: number;
}

export type MutableOrderFields = Partial<Pick<Order, "receiptFilePath" | "details" | "updatedAt" | "completedAt" | "status">>
