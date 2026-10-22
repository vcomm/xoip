import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// QoS dashboard location: prefer installed @vcomm/xoip-qos package, fallback to local source
const pkgDashboardDir = resolve(__dirname, 'node_modules/@vcomm/xoip-qos/dist/dashboard');
const srcDashboardDir = resolve(__dirname, '../../qos/dashboard');
const qosDashboardDir = fs.existsSync(pkgDashboardDir) ? pkgDashboardDir : srcDashboardDir;

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('._')) continue;
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  base: './',
  optimizeDeps: {
    // Exclude worker packages from pre-bundling so Web Workers retain proper relative URLs
    exclude: ['@vcomm/xoip-qos'],
  },
  resolve: {
    alias: {
      '@vcomm/qos': '@vcomm/xoip-qos',
      '/qos/dashboard': qosDashboardDir,
    },
  },
  server: {
    fs: {
      allow: [
        __dirname,
        resolve(__dirname, '../../qos'),
      ],
    },
  },
  plugins: [
    {
      name: 'qos-dashboard-plugin',

      // ── Dev server: serve dashboard at /qos/dashboard/ ──────────────
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/qos/dashboard') {
            res.writeHead(302, { Location: '/qos/dashboard/' });
            res.end();
            return;
          }
          if (url === '/qos/dashboard/' || url === '/qos/dashboard/index.html') {
            const htmlPath = resolve(qosDashboardDir, 'index.html');
            if (fs.existsSync(htmlPath)) {
              let html = fs.readFileSync(htmlPath, 'utf8');
              html = html.replace('src="./dashboard.js"', 'src="/qos/dashboard/dashboard.js"');
              html = await server.transformIndexHtml('/qos/dashboard/index.html', html);
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(html);
              return;
            }
          }
          next();
        });
      },

      // ── Production build: copy dashboard into dist/qos/dashboard/ ──
      closeBundle() {
        const outDir = resolve(__dirname, 'dist', 'qos', 'dashboard');
        if (fs.existsSync(qosDashboardDir)) {
          copyDirSync(qosDashboardDir, outDir);
          console.log(`[qos-dashboard-plugin] Copied dashboard → dist/qos/dashboard/`);
        } else {
          console.warn('[qos-dashboard-plugin] Dashboard source not found:', qosDashboardDir);
        }

        // Copy config.js into dist/qos/config.js because dashboard.js imports '../config.js'
        const qosDistDir = resolve(__dirname, 'node_modules/@vcomm/xoip-qos/dist');
        const configSrc = resolve(qosDistDir, 'config.js');
        const configDest = resolve(__dirname, 'dist', 'qos', 'config.js');
        if (fs.existsSync(configSrc)) {
          fs.copyFileSync(configSrc, configDest);
          console.log(`[qos-dashboard-plugin] Copied config.js → dist/qos/config.js`);
        }
      },
    },
  ],
});
