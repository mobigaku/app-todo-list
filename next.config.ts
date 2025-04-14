import type { NextConfig } from "next";
import { defaultConfig } from "next/dist/server/config-shared";

const nextConfig: NextConfig = {
  /* config options here */
  ...defaultConfig,
};

export default nextConfig;
