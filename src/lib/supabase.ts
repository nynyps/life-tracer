import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://afqrbasaoknraugzxawm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXJiYXNhb2tucmF1Z3p4YXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjY0MjUsImV4cCI6MjA4NDIwMjQyNX0.JXlFixTCV7Ofn-OjiKjwm5Dk_OwX9UXrFy3igrTwj_o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
