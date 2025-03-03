import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      users: data
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}