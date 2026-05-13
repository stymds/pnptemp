-- Used to dedupe order-confirmation emails between the client-verify path
-- and the payment webhook (both call markOrderPaid + sendOrderConfirmation).
ALTER TABLE "Order" ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);
