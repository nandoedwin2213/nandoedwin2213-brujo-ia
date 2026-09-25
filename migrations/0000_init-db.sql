CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'APPROVED', 'CANCELLED', 'REJECTED', 'ERROR');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"client_transaction_id" text NOT NULL,
	"payphone_transaction_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"raw_response" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_client_transaction_id_unique" UNIQUE("client_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"is_pro" boolean DEFAULT false NOT NULL,
	"pro_until" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
