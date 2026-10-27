import { CHANNELS } from '@/lib/channels';
import { getChannelAvatarResponse } from '@/lib/channel-avatar';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const channel = CHANNELS.find((item) => item.handle === handle);
  if (!channel) {
    return new Response('Channel not found', { status: 404 });
  }

  return getChannelAvatarResponse(channel.href, `/images/channels/${channel.handle}.jpg`);
}
