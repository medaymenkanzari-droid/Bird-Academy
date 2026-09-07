import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

function downloadArtifactsPlugin() {
  const handleDownload = (req: any, res: any, next: any) => {
    const rawUrl = req.url || '';
    const cleanUrl = rawUrl.split('?')[0];
    if (cleanUrl.startsWith('/downloads/')) {
      const filename = path.basename(decodeURIComponent(cleanUrl.replace('/downloads/', '')));
      if (!filename || filename === '.' || filename === '..') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'BAD_REQUEST', message: 'Nom de fichier invalide.' }));
        return;
      }

      const rootDir = configDirectory;
      const candidates = [
        path.join(rootDir, filename),
        path.join(rootDir, 'Release', 'Release-2026-Multilingual', filename),
        path.join(rootDir, 'Release', filename),
        path.join(rootDir, 'public', 'downloads', filename),
      ];

      if (filename === 'Bird-Academy-User-Windows-Setup.exe') {
        candidates.push(
          path.join(rootDir, 'Release', 'Release-2026-Multilingual', 'Bird-Academy-Avian-ERP-Setup.exe'),
          path.join(rootDir, 'Release', 'Bird-Academy-Avian-ERP-Setup.exe')
        );
      }
      if (filename === 'Bird-Academy-User.apk') {
        candidates.push(
          path.join(rootDir, 'Release', 'Release-2026-Multilingual', 'Bird-Academy-User.apk'),
          path.join(rootDir, 'Release', 'Bird-Academy-User-Release.apk')
        );
      }

      let targetPath: string | null = null;
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          targetPath = cand;
          break;
        }
      }

      if (!targetPath) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'NOT_FOUND', message: `Artefact ${filename} introuvable.` }));
        return;
      }

      const stat = fs.statSync(targetPath);
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.exe')) contentType = 'application/vnd.microsoft.portable-executable';
      else if (filename.endsWith('.apk')) contentType = 'application/vnd.android.package-archive';
      else if (filename.endsWith('.pdf')) contentType = 'application/pdf';
      else if (filename.endsWith('.zip')) contentType = 'application/zip';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');

      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
      return;
    }
    next();
  };

  return {
    name: 'download-artifacts-plugin',
    configureServer(server: any) {
      server.middlewares.use(handleDownload);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handleDownload);
    },
  };
}

function lmseAdminBackendPlugin() {
  let lmseServer: any;
  return {
    name: 'lmse-admin-backend-plugin',
    async configureServer(server: any) {
      const { LmseBackendServer } = await import('./src/server/lmseServer.ts');
      lmseServer = new LmseBackendServer();
      server.middlewares.use(lmseServer.app);
    },
    async configurePreviewServer(server: any) {
      const { LmseBackendServer } = await import('./src/server/lmseServer.ts');
      lmseServer = new LmseBackendServer();
      server.middlewares.use(lmseServer.app);
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      downloadArtifactsPlugin(),
      lmseAdminBackendPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'demo-bird.svg'],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          globIgnores: ['**/win-unpacked/**', '**/*.exe', '**/builder-debug.yml'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
        manifest: {
          name: "Bird Academy - Volière Manager",
          short_name: "Bird Academy",
          description: "Gestion d'élevage professionnel d'oiseaux",
          theme_color: "#4f46e5",
          background_color: "#1e293b",
          display: "standalone",
          start_url: "/",
          scope: "/",
          id: "/",
          lang: "fr",
          dir: "ltr",
          orientation: "any",
          categories: ["productivity", "utilities"],
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(configDirectory, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: process.env.VITE_APP_MODE === 'admin' 
          ? path.resolve(configDirectory, 'admin.html')
          : path.resolve(configDirectory, 'index.html'),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
            if (id.includes('node_modules/motion')) return 'motion-vendor';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/data/**',
          '**/.lmse/**',
          '**/Release/**',
          '**/dist_admin/**',
          '**/dist_user/**',
          '**/tests/**',
          '**/*.log',
        ],
      },
    },
  };
});
