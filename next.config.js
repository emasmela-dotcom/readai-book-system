/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid EMFILE / stuck dev on macOS when many files are watched
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**'],
      }
    }
    return config
  },
}

module.exports = nextConfig

