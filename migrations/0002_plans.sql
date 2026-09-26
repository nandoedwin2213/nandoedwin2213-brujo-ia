CREATE TYPE "public"."plan" AS ENUM('free', 'premium', 'vip');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "plan" "plan" DEFAULT 'premium' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan" "plan" DEFAULT 'free' NOT NULL;--> statement-breakpoint
UPDATE "subscriptions" SET "plan" = 'premium' WHERE "is_pro" = true;
