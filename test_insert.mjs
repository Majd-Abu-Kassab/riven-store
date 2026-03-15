import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uxayxjquvrzuocklxhnk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YXl4anF1dnJ6dW9ja2x4aG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTY5NjUsImV4cCI6MjA4OTA3Mjk2NX0.9sVcIBbl2avxSPZnRnNo9ZN7BmNgx9QieI833s5DW98'
);

async function testInsert() {
  console.log('Testing raw insert...');
  
  // Try to login to get RLS access
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'majdabokassab@yahoo.com',
    password: 'Majd$7314'
  });
  
  if (authErr) {
    console.error('Auth error:', authErr);
    return;
  }
  
  console.log('Logged in as:', authData.user.id);
  
  const payload = {
    name: 'Raw Node Test',
    slug: 'raw-node-test-' + Date.now(),
    price: 99.99,
    category_id: null,
    stock_quantity: 1,
    is_featured: false,
    is_active: true
  };
  
  console.log('Sending insert...');
  const { data, error } = await supabase.from('products').insert(payload).select();
  
  console.log('Insert Response:', { data, error });
  
  if (!error) {
    console.log('Cleaning up by deleting the test row...');
    await supabase.from('products').delete().eq('id', data[0].id);
    console.log('Cleanup done.');
  }
}

testInsert().catch(console.error);
