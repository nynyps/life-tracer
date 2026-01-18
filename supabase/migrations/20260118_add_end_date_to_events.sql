-- Add end_date column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS end_date text;

-- Comment on column
COMMENT ON COLUMN events.end_date IS 'ISO date string (YYYY-MM-DD) for the end date of the event';
