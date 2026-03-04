import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drqyvhwgnuvrcmwthwwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycXl2aHdnbnV2cmNtd3Rod3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODQyNTUsImV4cCI6MjA4MzM2MDI1NX0.0wFIEqDhh9VfhMmktkRmqvErasLmZTkze3whmp54s3o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
