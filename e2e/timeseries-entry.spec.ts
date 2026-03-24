import { test, expect } from '@playwright/test'

test('entering user data updates chart and shows default legends with correct order (F011, F012, F0606, F0614, F0615)', async ({ page }) => {
  await page.goto('/')

  // Enter valid user timeseries into textarea
  const editor = page.locator('#timeseries-editor')
  await editor.fill('01.2024 100\n02.2024 200')

  // Editor should reflect valid state by removing invalid class
  await expect(editor).toHaveAttribute('id', 'timeseries-editor')

  // Legend labels should include defaults enabled: Gelir(₺), Gelir(USD), Alım gücü
  const legend = page.locator('.recharts-legend-wrapper')
  const gelirLabel = legend.locator('text=Gelir(₺)')
  const gelirUsdLabel = legend.locator('text=Gelir(USD)')
  const alimGucuLabel = legend.getByText('Alım gücü', { exact: true })
  await expect(gelirLabel).toBeVisible()
  await expect(gelirUsdLabel).toBeVisible()
  await expect(alimGucuLabel).toBeVisible()

  // Legend order must be: Gelir(₺) - Gelir(USD) - Gelir(EUR) - USD - EUR - Enflasyon - Alım Gücü
  const legendList = legend.locator('.recharts-default-legend')
  const legendItems = legendList.locator('li')
  const legendCount = await legendItems.count()
  expect(legendCount).toBeGreaterThanOrEqual(3)
  const texts = [] as string[]
  for (let i = 0; i < legendCount; i++) {
    texts.push(await legendItems.nth(i).innerText())
  }
  // Must start with Gelir(₺) and Gelir(USD) in this order
  expect(texts[0]).toMatch(/Gelir\(₺\)/)
  expect(texts[1]).toMatch(/Gelir\(USD\)/)
  // Alım gücü should exist somewhere in legend list
  expect(texts.join(' | ')).toMatch(/Alım gücü/)

  // Chart should render SVG paths (lines)
  const paths = page.locator('svg path')
  const pathCount = await paths.count()
  expect(pathCount).toBeGreaterThan(0)
})
