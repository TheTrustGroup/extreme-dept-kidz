-- Add optional pos (AssignedPos) to Order for POS-scoped order listing
-- Safe: column is nullable; existing orders remain unscoped.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Order' AND column_name = 'pos'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "pos" "AssignedPos" NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Order_pos_idx" ON "Order"("pos");
