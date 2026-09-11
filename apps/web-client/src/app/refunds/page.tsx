import { LegalPage } from "@/components/legal-page";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. General",
    body: "Because our food is freshly prepared and made to order, all orders are taken on a no-refund basis once preparation has begun. However, we will gladly resolve genuine issues within the conditions described below.",
  },
  {
    title: "2. Cancellation",
    body: "You may cancel your order free of charge before our team begins preparing it. Once preparation has started, the order can no longer be cancelled. Please contact us by phone as soon as possible if you wish to cancel.",
  },
  {
    title: "3. Refunds for pre-paid (Turbo UPI) orders",
    body: "If a pre-paid order is cancelled by us (for example, because of item unavailability) or cancelled by you before preparation begins, the full amount you paid will be refunded to the original payment method within 5–7 business days.",
  },
  {
    title: "4. Incorrect or damaged orders",
    body: "If you receive an incorrect item, or your food is unsatisfactory when collected, report it to us at the store or within 24 hours via abhinabchoudhury291@gmail.com. We will re-prepare your order or issue a credit as appropriate.",
  },
  {
    title: "5. No-show policy",
    body: "Orders that are prepared and not picked up remain payable. Cash orders prepared but not collected are still due at the store.",
  },
];

export const metadata = {
  title: "Refund and Cancellation Policy — Pinocchio's Pizza",
  description:
    "Refund and cancellation policy for orders placed with Pinocchio's Pizza.",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund and Cancellation Policy" effectiveDate="1 January 2026">
      <p className="text-muted-foreground">
        Please read this policy carefully as it explains when you can cancel an
        order and how refunds are processed.
      </p>
      {sections.map((section) => (
        <Card key={section.title}>
          <CardContent className="p-6">
            <h2 className="font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </LegalPage>
  );
}