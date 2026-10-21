import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const qosDir = resolve(__dirname, '../../qos');

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@vcomm/qos': resolve(qosDir, 'index.js'),
      'chart.js': resolve(qosDir, 'node_modules/chart.js'),
      '/qos/dashboard': resolve(qosDir, 'dashboard'),
    },
  },
  server: {
    fs: {
      allow: [
        __dirname,
        qosDir,
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
            const htmlPath = resolve(qosDir, 'dashboard/index.html');
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
