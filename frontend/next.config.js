/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    GRAPHQL_WS_ENDPOINT: process.env.GRAPHQL_WS_ENDPOINT || 'ws://localhost:4000/graphql',
  },
}

module.exports = nextConfig
