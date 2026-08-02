import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ku'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/', '/(ku|en)/:path*']
};
