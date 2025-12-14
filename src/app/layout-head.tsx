export default function LayoutHead() {
  return (
    <>
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL!} />

      {/* DNS Prefetch for payment providers */}
      <link rel="dns-prefetch" href="https://js.stripe.com" />
      <link rel="dns-prefetch" href="https://www.paypal.com" />
      <link rel="dns-prefetch" href="https://www.paypalobjects.com" />

      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/_next/static/media/inter-latin-400-normal.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Prefetch critical pages */}
      <link rel="prefetch" href="/tools" />
      <link rel="prefetch" href="/smart-prompts" />
    </>
  );
}