/** @type {import('next').NextConfig} */
const nextConfig = {
  // These packages ship native/optional binaries or heavy CJS that shouldn't be
  // bundled by webpack for server components / route handlers — keep them external.
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'ioredis'],
  },
};

module.exports = nextConfig;
