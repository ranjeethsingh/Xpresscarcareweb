import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Force dynamic execution so Vercel doesn't cache the database response
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Security check to ensure only your Vercel Cron can trigger this
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Selects just 1 record from your 'profiles' table to wake up the database
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Supabase pinged successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
