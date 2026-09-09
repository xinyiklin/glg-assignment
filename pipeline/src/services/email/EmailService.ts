import nodemailer from 'nodemailer';
import { Order } from "../../definitions/entities/Order";

interface EmailParameters {
  order: Order;
  receipt: Buffer;
}

interface CancellationEmailParameters {
  order: Order;
}

const { SMTP_HOST, SMTP_PORT } = process.env;

export class EmailService {
  private static getBody(order: Order): string {
    return `Dear ${order.details?.customer.name},
      Thank you for your purchase! Please find your receipt attached.
      
      Best regards,
      Your Company`;
  }

  private static getTransporter() {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
    });
  }

  public static async sendEmail({ order, receipt }: EmailParameters): Promise<void> {
    const transporter = this.getTransporter();

    const mailOptions = {
      from: '"Your Company" <no-reply@yourcompany.com>',
      to: order.details?.customer.email,
      subject: `Receipt for Order ${order.orderId}`,
      text: this.getBody(order),
      attachments: [
        {
          filename: `receipt_${order.orderId}.pdf`,
          content: receipt,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  }

  public static async sendCancellationEmail({ order }: CancellationEmailParameters): Promise<void> {
    const transporter = this.getTransporter();
    await transporter.sendMail({
      from: '"Your Company" <no-reply@yourcompany.com>',
      to: order.details?.customer.email,
      subject: `Cancellation for Order ${order.orderId}`,
      text: `Dear ${order.details?.customer.name},\n\nYour order ${order.orderId} has been cancelled.\n\nBest regards,\nYour Company`,
    });
  }
}
