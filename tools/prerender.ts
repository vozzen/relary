import { chromium } from 'playwright'
import { preview } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Build-time prerendering script (F0809).
 * Serves the built dist, opens it with Playwright, captures rendered HTML,
 * and injects it into dist/index.html so crawlers see real content.
 */
async function prerender() {
  const distDir = resolve(import.meta.dirname, '../dist')
  const indexPath = resolve(distDir, 'index.html')

  // Start Vite preview server
  const server = await preview({ preview: { port: 4174, strictPort: true } })
  const url = 'http://localhost:4174/'

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait for the app to render
    await page.waitForSelector('.home-page', { timeout: 10000 })

    // Get the rendered HTML of #root
    const rootHtml = await page.$eval('#root', (el) => el.innerHTML)

    // Read original index.html and inject prerendered content
    let html = readFileSync(indexPath, 'utf-8')
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${rootHtml}</div>`
    )

    writeFileSync(indexPath, html)
    console.log('Prerendered index.html successfully')
  } finally {
    await browser.close()
    server.httpServer.close()
  }
}

prerender().catch((err) => {
  console.error('Prerendering failed:', err)
  process.exit(1)
})
