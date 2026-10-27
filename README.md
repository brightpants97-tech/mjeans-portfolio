This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Channel profile images

The home page loads `/api/channel-avatar/[handle]` for the three channels in
`lib/channels.ts`. The route reads the channel's current public `og:image` and
serves validated image bytes. No YouTube API key or manual redeploy is required
when a channel changes its profile photo.

Successful images are cached at the CDN for one hour (plus up to five minutes
while revalidating) and in the browser for five minutes. Refreshes happen on a
visit after the cache expires, not through a scheduled job or an open-page timer.
If YouTube is unavailable, the route uses the bundled profile photos in
`public/images/channels/` and retries after a short one-minute cache. These
fallback photos were captured on 2026-10-27; they are not updated during an outage.
Only listed handles and YouTube's avatar image hosts are accepted.

Run the avatar regression checks with `npm test` on Node.js 22.6+ and the
production validation with `npm run build`.
