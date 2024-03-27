ALTER TABLE "app_generation" ALTER COLUMN "requestId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "app_generation" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "app_generation" DROP COLUMN IF EXISTS "url";--> statement-breakpoint
ALTER TABLE "app_generation" ADD CONSTRAINT "app_generation_requestId_unique" UNIQUE("requestId");