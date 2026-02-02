import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist-server/index.js',
    format: 'esm',
    external: ['express', 'openai', 'pg', 'dotenv'], // evita "could not resolve"
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
  })
  .catch(() => process.exit(1));
