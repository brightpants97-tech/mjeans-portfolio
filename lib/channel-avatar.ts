const AVATAR_HOSTS = new Set(['yt3.googleusercontent.com', 'yt3.ggpht.com']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 1024 * 1024;

/** Read the channel's profile image, never a video thumbnail from the page. */
export function extractChannelAvatarUrl(html: string): string | null {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = new Map<string, string>();
    for (const attribute of tag[0].matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
      attributes.set(attribute[1].toLowerCase(), attribute[3]);
    }
    if ((attributes.get('property') || attributes.get('name'))?.toLowerCase() !== 'og:image') continue;

    const content = attributes.get('content');
    if (!content) continue;
    try {
      const url = new URL(content.replace(/&amp;/g, '&'));
      if (url.protocol !== 'https:' || !AVATAR_HOSTS.has(url.hostname) || url.port || url.username || url.password) continue;
      // Cards display at 60px; keep enough detail for high-density screens.
      url.pathname = url.pathname.replace(/=s\d+(?=-|$)/, '=s240');
      return url.href;
    } catch {
      // Missing/changed metadata is handled by the local fallback below.
    }
  }
  return null;
}

/** The route supplies an allowlisted channel URL and a bundled fallback path. */
export async function getChannelAvatarResponse(
  channelUrl: string,
  fallbackPath: string,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  try {
    const signal = AbortSignal.timeout(8000);
    const page = await fetcher(channelUrl, {
      cache: 'no-store',
      signal,
      headers: { Accept: 'text/html', 'Accept-Language': 'ko,en;q=0.8' },
    });
    if (!page.ok) throw new Error('Channel page unavailable');
    const avatarUrl = extractChannelAvatarUrl(await page.text());
    if (!avatarUrl) throw new Error('Channel profile image missing');

    const image = await fetcher(avatarUrl, {
      cache: 'no-store',
      signal,
      redirect: 'error',
    });
    const contentType = image.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (!image.ok || !contentType || !IMAGE_TYPES.has(contentType)) throw new Error('Invalid channel image');
    if (Number(image.headers.get('content-length')) > MAX_IMAGE_BYTES) throw new Error('Channel image too large');
    const bytes = await image.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('Invalid channel image size');

    // Cache the image bytes, not a redirect to a URL YouTube may later delete.
    // After one hour, the CDN refreshes from the channel on the next visit.
    return new Response(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    // Keep a real profile photo visible during a YouTube outage and retry soon.
    return new Response(null, {
      status: 307,
      headers: {
        Location: fallbackPath,
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  }
}
