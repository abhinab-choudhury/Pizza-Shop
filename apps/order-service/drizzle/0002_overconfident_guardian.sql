ALTER TABLE "orders" ADD COLUMN "user_id" uuid;--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");