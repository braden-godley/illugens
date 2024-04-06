ALTER TABLE "app_generation" ADD COLUMN "createdBy" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "app_generation" ADD COLUMN "createdOn" timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_generation" ADD CONSTRAINT "app_generation_createdBy_app_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
