
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyxebsthgzgffwliadie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eGVic3RoZ3pnZmZ3bGlhZGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA2NDM4NywiZXhwIjoyMDk3NjQwMzg3fQ.pjgUE1W26u8mJJTwB9dGMcwnZhUoA4KLWx8E8DU3rTM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listFiles() {
  const { data, error } = await supabase.storage.from('posters').list('', {
    limit: 10,
  });
  if (error) {
    console.error('Error listing files:', error);
  } else {
    console.log('Files:', data);
  }
}

listFiles();
