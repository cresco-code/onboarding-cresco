import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const nextConfig: NextConfig = {
  // fija la raíz del workspace a esta app (hay otros lockfiles en el árbol)
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
