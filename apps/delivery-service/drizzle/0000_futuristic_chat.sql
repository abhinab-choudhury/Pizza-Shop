CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"zone_id" uuid,
	"rider_id" uuid,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_note" text,
	"fee_cents" integer DEFAULT 0 NOT NULL,
	"eta_minutes" integer,
	"assigned_at" timestamp (3) with time zone,
	"accepted_at" timestamp (3) with time zone,
	"picked_up_at" timestamp (3) with time zone,
	"delivered_at" timestamp (3) with time zone,
	"cancelled_at" timestamp (3) with time zone,
	"cancelled_reason" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"fee_cents" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_zones_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "riders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"vehicle_type" varchar(50) DEFAULT 'bike' NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"current_lat" double precision,
	"current_lng" double precision,
	"last_seen_at" timestamp (3) with time zone,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "riders_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_zone_id_delivery_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."delivery_zones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_rider_id_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."riders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deliveries_status_idx" ON "deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deliveries_rider_id_idx" ON "deliveries" USING btree ("rider_id");--> statement-breakpoint
CREATE INDEX "deliveries_zone_id_idx" ON "deliveries" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "riders_user_id_idx" ON "riders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "riders_online_idx" ON "riders" USING btree ("is_online");