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
      name: 'serve-qos-dashboard',
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
    },
  ],
});
