import { LegalPage } from "@/components/legal-page";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const details = [
  {
    icon: Mail,
    label: "Email",
    value: "abhinabchoudhury291@gmail.com",
    href: "mailto:abhinabchoudhury291@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 7077664878",
    href: "tel:+917077664878",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "14, MG Road, Bengaluru, Karnataka 560001, India",
  },
  {
    icon: Clock,
    label: "Counter hours",
    value: "11:00 AM – 10:30 PM, all days",
  },
];

export const metadata = {
  title: "Contact Us — Pinocchio's Pizza",
  description:
    "Get in touch with Pinocchio's Pizza for support, order queries, and feedback.",
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us / Support" effectiveDate="1 January 2026">
      <p className="text-muted-foreground">
        We&apos;d love to hear from you. For order questions, support requests,
        or feedback, reach us through any of the channels below.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {details.map((detail) => {
          const Icon = detail.icon;
          const content = (
            <>
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </p>
                <p className="mt-1 font-medium">{detail.value}</p>
              </div>
            </>
          );

          return (
            <Card key={detail.label}>
              <CardContent className="p-5">
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="flex items-start gap-3 hover:opacity-80"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-start gap-3">{content}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold">Order support</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Most queries are resolved at the store. For anything else, email abhinabchoudhury291@gmail.com with your order number (found
            in My Orders) and we&apos;ll get back to you within one business day.
          </p>
        </CardContent>
      </Card>
    </LegalPage>
  );
}