/**
 * Email Notification Service for UCONEXT
 * Handles transactional emails: Order Confirmation, Status Updates, Cancellation.
 */

interface OrderNotificationData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: string;
}

export const emailService = {
  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(data: OrderNotificationData): Promise<boolean> {
    try {
      console.log(`\n==================================================`);
      console.log(`📧 [EMAIL SERVICE] - ORDER CONFIRMATION`);
      console.log(`To: ${data.customerName} <${data.customerEmail}>`);
      console.log(`Order ID: #${data.orderId}`);
      console.log(`Total: ${data.totalAmount.toLocaleString('vi-VN')} VND`);
      console.log(`Items: ${data.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}`);
      console.log(`Delivery Address: ${data.shippingAddress}`);
      console.log(`Status: Confirmed - Pending Processing`);
      console.log(`==================================================\n`);
      return true;
    } catch (err: any) {
      console.error('❌ Failed to send order confirmation email:', err.message);
      return false;
    }
  },

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(customerEmail: string, orderId: string, status: string): Promise<boolean> {
    try {
      console.log(`\n==================================================`);
      console.log(`📧 [EMAIL SERVICE] - ORDER STATUS UPDATE`);
      console.log(`To: ${customerEmail}`);
      console.log(`Order ID: #${orderId}`);
      console.log(`New Status: ${status.toUpperCase()}`);
      console.log(`==================================================\n`);
      return true;
    } catch (err: any) {
      console.error('❌ Failed to send order status update email:', err.message);
      return false;
    }
  }
};

