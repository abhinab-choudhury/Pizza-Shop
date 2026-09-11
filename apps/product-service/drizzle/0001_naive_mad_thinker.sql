ALTER TABLE "products" ADD COLUMN "sizes" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "toppings" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "add_ons" jsonb DEFAULT '[]'::jsonb;