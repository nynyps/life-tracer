-- Add emotional_valence and is_current columns to events table

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS emotional_valence INTEGER CHECK (emotional_valence >= -5 AND emotional_valence <= 5),
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN events.emotional_valence IS 'Scale from -5 (very bad) to +5 (very good)';
COMMENT ON COLUMN events.is_current IS 'If true, the event is considered ongoing until today';
