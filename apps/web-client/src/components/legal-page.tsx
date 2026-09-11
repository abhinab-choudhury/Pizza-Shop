import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective {effectiveDate}
      </p>

      <div className="mt-8 space-y-6">{children}</div>

      <Card className="mt-10">
        <CardContent className="space-y-1 p-6 text-sm">
          <p className="font-semibold">Questions?</p>
          <p className="text-muted-foreground">
            Reach us at{" "}
            <a
              href="mailto:support@pinocchiospizza.in"
              className="font-medium text-primary hover:underline"
            >
              support@pinocchiospizza.in
            </a>{" "}
            or visit our{" "}
            <a href="/contact" className="font-medium text-primary hover:underline">
              Contact page
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}