DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "app_generation" ADD COLUMN "status" "status";