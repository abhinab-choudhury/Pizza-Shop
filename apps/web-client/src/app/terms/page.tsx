import { LegalPage } from "@/components/legal-page";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. Agreement to these terms",
    body: "By placing an order through Pinocchio's Pizza, you agree to these Terms and Conditions. If you do not agree with any part of these terms, please do not place an order with us.",
  },
  {
    title: "2. Orders and payment",
    body: "All orders placed through our website are take-away orders — hot and ready for pickup at our counter. Payment can be made by cash on pickup or online via Turbo UPI, processed securely through Razorpay. Your payment is accepted only once the order has been confirmed by our team.",
  },
  {
    title: "3. Menu and pricing",
    body: "Menu items, sizes, toppings, add-ons, and prices are displayed in Indian Rupees (₹) on our menu page. Prices include applicable taxes. We may update the menu and prices from time to time without prior notice; the price at the time you place your order applies.",
  },
  {
    title: "4. Order confirmation and status",
    body: "Orders move through the following stages: pending, confirmed, preparing, ready, completed, or cancelled. Your order is considered placed once it is submitted. Please ensure your order details are correct before confirming your purchase.",
  },
  {
    title: "5. Food quality and safety",
    body: "We prepare food to order with care for hygiene and quality. Please consume your food promptly after pickup for the best quality. If you receive an incorrect or unsatisfactory order, please contact us immediately.",
  },
  {
    title: "6. Limitation of liability",
    body: "To the maximum extent permitted by law, Pinocchio's Pizza shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services.",
  },
];

export const metadata = {
  title: "Terms and Conditions — Pinocchio's Pizza",
  description:
    "The terms and conditions governing the use of Pinocchio's Pizza online ordering.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" effectiveDate="1 January 2026">
      <p className="text-muted-foreground">
        These terms govern your use of the Pinocchio&apos;s Pizza online
        ordering service and the purchase of food from our store.
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