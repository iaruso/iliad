import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);