/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose ADMIN_EMAIL so middleware (Edge runtime) can read it
  env: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  },
}

module.exports = nextConfig
