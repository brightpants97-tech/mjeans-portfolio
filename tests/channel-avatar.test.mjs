import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractChannelAvatarUrl, getChannelAvatarResponse } from '../lib/channel-avatar.ts';

const channel = 'https://www.youtube.com/@jisoujang';
const fallback = '/images/channels/jisoujang.jpg';
const avatar = 'https://yt3.googleusercontent.com/new-profile=s900-c-k-c0x00ffffff-no-rj';
const metadata = (url = avatar) => `<meta property="og:image" content="${url}">`;
const photo = () => new Response(new Uint8Array([255, 216, 255, 217]), { headers: { 'Content-Type': 'image/jpeg' } });

function expectFallback(response) {
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), fallback);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60, s-maxage=60');
}

test('reads profile metadata with changed attribute order, quotes, casing, and entities', () => {
  assert.equal(
    extractChannelAvatarUrl(`<META content='${avatar}?a=1&amp;b=2' property='og:image'>`),
    'https://yt3.googleusercontent.com/new-profile=s240-c-k-c0x00ffffff-no-rj?a=1&b=2',
  );
  assert.equal(extractChannelAvatarUrl(metadata(avatar.replace('yt3.googleusercontent.com', 'yt3.ggpht.com'))),
    'https://yt3.ggpht.com/new-profile=s240-c-k-c0x00ffffff-no-rj');
});

test('rejects video thumbnails and untrusted image locations', () => {
  for (const url of ['https://i.ytimg.com/vi/video/maxresdefault.jpg', 'https://example.com/image.jpg',
    'http://yt3.googleusercontent.com/image.jpg', 'https://yt3.googleusercontent.com.evil.example/image.jpg',
    'https://user:secret@yt3.googleusercontent.com/image.jpg', 'https://yt3.googleusercontent.com:8443/image.jpg', 'invalid']) {
    assert.equal(extractChannelAvatarUrl(metadata(url)), null);
  }
  assert.equal(extractChannelAvatarUrl('<html>Consent or temporary error</html>'), null);
});

test('uses the newly changed profile URL on the next uncached refresh and serves image bytes', async () => {
  const fetched = [];
  for (const name of ['before-change', 'after-change']) {
    const response = await getChannelAvatarResponse(channel, fallback, async (url, options) => {
      assert.equal(options.cache, 'no-store');
      assert.ok(options.signal instanceof AbortSignal);
      if (url === channel) return new Response(metadata(`https://yt3.googleusercontent.com/${name}=s900-c`));
      assert.equal(options.redirect, 'error');
      fetched.push(url);
      return photo();
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/jpeg');
    assert.equal(response.headers.get('location'), null);
    assert.match(response.headers.get('cache-control'), /s-maxage=3600/);
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), new Uint8Array([255, 216, 255, 217]));
  }
  assert.deepEqual(fetched, ['https://yt3.googleusercontent.com/before-change=s240-c', 'https://yt3.googleusercontent.com/after-change=s240-c']);
});

test('a YouTube outage or timeout uses a local photo and only caches failure briefly', async () => {
  for (const failure of [new Error('Network unavailable'), new DOMException('Timed out', 'TimeoutError')]) {
    expectFallback(await getChannelAvatarResponse(channel, fallback, async () => { throw failure; }));
  }
  expectFallback(await getChannelAvatarResponse(channel, fallback, async () => new Response('', { status: 503 })));
});

test('missing or unsafe metadata never triggers a second network request', async () => {
  for (const html of ['<html>Consent required</html>', metadata('https://example.com/image.jpg')]) {
    let calls = 0;
    expectFallback(await getChannelAvatarResponse(channel, fallback, async () => { calls++; return new Response(html); }));
    assert.equal(calls, 1);
  }
});

test('deleted CDN URLs, non-images, empty and oversized images fall back safely', async () => {
  const invalidImages = [
    () => new Response('', { status: 404 }),
    () => new Response('<html>Error</html>', { headers: { 'Content-Type': 'text/html' } }),
    () => new Response('', { headers: { 'Content-Type': 'image/jpeg' } }),
    () => new Response('too large', { headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '2000000' } }),
    () => new Response(new Uint8Array(1024 * 1024 + 1), { headers: { 'Content-Type': 'image/jpeg' } }),
  ];
  for (const invalid of invalidImages) {
    expectFallback(await getChannelAvatarResponse(channel, fallback, async (url) => url === channel ? new Response(metadata()) : invalid()));
  }
});
