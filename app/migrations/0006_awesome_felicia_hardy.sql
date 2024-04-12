CREATE TABLE IF NOT EXISTS "app_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"tokens" integer NOT NULL
);
--> statement-breakpoint
DROP TABLE "app_account";--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_order" ADD CONSTRAINT "app_order_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
