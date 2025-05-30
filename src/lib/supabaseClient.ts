import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  'https://scdqkzvraociuznmtplo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZHFrenZyYW9jaXV6bm10cGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTUwMzcsImV4cCI6MjA2NDEzMTAzN30.KE-zLj7BebGsxEs6COnJJw9kJSfZAzGBv4HsXayyK4M'
);
