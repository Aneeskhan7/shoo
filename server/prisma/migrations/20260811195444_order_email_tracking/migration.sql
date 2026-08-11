-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "deliveredEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "shippedEmailSentAt" TIMESTAMP(3);
