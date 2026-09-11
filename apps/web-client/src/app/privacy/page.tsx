import { LegalPage } from "@/components/legal-page";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "What we collect",
    body: "When you place an order, we collect your name, email address, the items in your order, the payment method you choose, and your order history. We do not collect or store your UPI payment credentials — those are handled entirely by our payment processor, Razorpay.",
  },
  {
    title: "How we use your information",
    body: "We use your information to process and fulfil your orders, keep you updated on order status, respond to support requests, and improve our store and website. We do not sell or rent your personal data to third parties.",
  },
  {
    title: "Payment processing",
    body: "Online payments are processed by Razorpay, our payment gateway partner. Razorpay collects and handles the minimum data required to complete your Turbo UPI payment. We recommend reviewing Razorpay's privacy and terms at https://razorpay.com.",
  },
  {
    title: "Data storage and security",
    body: "Order records are stored securely and access is restricted to authorised staff. We apply reasonable technical and organisational measures to protect your data against unauthorised access, alteration, or loss.",
  },
  {
    title: "Cookies and local storage",
    body: "Our website uses browser local storage to remember your theme preference. We do not use advertising trackers.",
  },
  {
    title: "Your rights",
    body: "You may request a copy of the personal information we hold about you, ask us to correct inaccuracies, or request deletion of your data by contacting us. We will respond to such requests within a reasonable timeframe.",
  },
];

export const metadata = {
  title: "Privacy Policy — Pinocchio's Pizza",
  description:
    "How Pinocchio's Pizza collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="1 January 2026">
      <p className="text-muted-foreground">
        Your privacy matters to us. This policy explains what information we
        collect when you use our online ordering service and how it is used.
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