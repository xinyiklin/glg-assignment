export interface OrderMessage {
  orderId: string;
  kind?: "cancellation";
}
