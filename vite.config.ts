import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Vite plugin to update sitemap.xml lastmod date on build (F0806).
 */
function sitemapLastmod() {
  return {
    name: 'sitemap-lastmod',
    closeBundle() {
      const sitemapPath = resolve(__dirname, 'dist/sitemap.xml')
      try {
        let content = readFileSync(sitemapPath, 'utf-8')
        const today = new Date().toISOString().split('T')[0]
        content = content.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${today}</lastmod>`)
        writeFileSync(sitemapPath, content)
      } catch {
        // sitemap might not exist in dev
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitemapLastmod()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
  },
})
