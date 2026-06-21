import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: bids } = await supabase
    .from('bids')
    .select('created_at, pieces(title)')
    .order('created_at', { ascending: false })
    .limit(6);

  const activity = (bids ?? [])
    .filter((b) => b.pieces?.title)
    .map((b) => ({ title: b.pieces.title, createdAt: b.created_at }));

  return Response.json({ activity });
}
