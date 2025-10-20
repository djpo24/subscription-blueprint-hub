-- Add columns to point_redemptions to track package discounts
ALTER TABLE point_redemptions
ADD COLUMN package_id uuid REFERENCES packages(id),
ADD COLUMN price_per_kilo numeric,
ADD COLUMN discount_amount numeric DEFAULT 0;

-- Add index for better performance
CREATE INDEX idx_point_redemptions_package_id ON point_redemptions(package_id);

-- Add column to packages to track applied discounts
ALTER TABLE packages
ADD COLUMN discount_applied numeric DEFAULT 0;

COMMENT ON COLUMN point_redemptions.package_id IS 'Package where the discount was applied';
COMMENT ON COLUMN point_redemptions.price_per_kilo IS 'Price per kilo used to calculate discount';
COMMENT ON COLUMN point_redemptions.discount_amount IS 'Total discount amount applied to package';
COMMENT ON COLUMN packages.discount_applied IS 'Total discount applied from point redemptions';