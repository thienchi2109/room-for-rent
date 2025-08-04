/*
  Warnings:

  - You are about to drop the column `type` on the `rooms` table. All the data in the column will be lost.
  - Added the required column `capacity` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/

-- Add capacity column with default value first
ALTER TABLE "rooms" ADD COLUMN "capacity" INTEGER;

-- Update capacity based on existing type values
UPDATE "rooms" SET "capacity" = CASE 
  WHEN "type" LIKE '%đơn%' OR "type" LIKE '%Đơn%' THEN 1
  WHEN "type" LIKE '%đôi%' OR "type" LIKE '%Đôi%' THEN 2
  WHEN "type" LIKE '%gia đình%' OR "type" LIKE '%Gia đình%' OR "type" LIKE '%family%' THEN 4
  WHEN "type" LIKE '%VIP%' OR "type" LIKE '%vip%' THEN 2
  ELSE 1 -- Default to 1 for any other type
END;

-- Make capacity NOT NULL
ALTER TABLE "rooms" ALTER COLUMN "capacity" SET NOT NULL;

-- Drop the type column
ALTER TABLE "rooms" DROP COLUMN "type";
