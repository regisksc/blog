import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

let commitSha = process.env.SOURCE_COMMIT || 'unknown'
try {
  commitSha = execSync('git rev-parse --short HEAD').toString().trim()
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Pin the workspace root so Turbopack resolves this project's node_modules
  // instead of a stray parent lockfile (~/package-lock.json).
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
