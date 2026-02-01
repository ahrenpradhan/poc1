import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file
config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build - types mismatch between @repo/ui (React 18) and web (React 19)
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "@": [
          path.resolve(__dirname, "./"),
          path.resolve(__dirname, "../../packages/ui/src"),
        ],
      },
    },
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
