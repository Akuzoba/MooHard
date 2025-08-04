/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
  },
};

module.exports = nextConfig;
