/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // TypeScript 7 (the native compiler) doesn't expose the legacy compiler API
    // Next's bundled type-checker expects, so route Next through the TS CLI.
    useTypeScriptCli: true,
  },
};
export default nextConfig;
