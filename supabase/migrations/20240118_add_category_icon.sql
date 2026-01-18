-- Add icon column to categories table if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'heart';

-- Update existing categories to have a default icon
UPDATE categories 
SET icon = 'heart' 
WHERE icon IS NULL;
