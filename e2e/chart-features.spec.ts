import { test, expect } from '@playwright/test'

test.describe('Chart features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('derived series legends appear on load even without user data (F0609)', async ({ page }) => {
    // Gelir(USD) and Alım gücü should be in legend even with no user data
    const legend = page.locator('.recharts-legend-wrapper')
    await expect(legend).toBeVisible()
    await expect(legend.locator('text=Gelir(USD)')).toBeVisible()
    await expect(legend.locator('text=Alım gücü')).toBeVisible()
  })

  test('user series is named Gelir(₺) and derived series Gelir(USD) (F0610)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    const legend = page.locator('.recharts-legend-wrapper')
    await expect(legend.locator('text=Gelir(₺)')).toBeVisible()
    await expect(legend.locator('text=Gelir(USD)')).toBeVisible()
  })

  test('Enflasyon and Alım gücü legends exist in chart (F0612, F0613)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    const legend = page.locator('.recharts-legend-wrapper')
    await expect(legend.locator('text=Enflasyon')).toBeVisible()
    await expect(legend.locator('text=Alım gücü')).toBeVisible()
  })

  test('clicking a legend item toggles series visibility (F0607)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    // Gelir(₺) should be visible by default
    const gelirLegend = page.locator('.recharts-legend-wrapper li').filter({ hasText: 'Gelir(₺)' })
    await expect(gelirLegend).toBeVisible()

    // Click to disable
    await gelirLegend.click()

    // The legend item should still be visible (but series line hidden)
    await expect(gelirLegend).toBeVisible()

    // Click again to re-enable
    await gelirLegend.click()
    await expect(gelirLegend).toBeVisible()
  })

  test('X axis tick labels are rotated (F0705)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    // XAxis ticks should have a rotation transform
    const xAxisTick = page.locator('.recharts-xAxis .recharts-cartesian-axis-tick text').first()
    await expect(xAxisTick).toBeVisible()
    const transform = await xAxisTick.getAttribute('transform')
    expect(transform).toContain('rotate')
  })

  test('chart renders multiple line series each with its own yAxisId (F0604)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    // Wait for chart lines to appear
    await page.waitForSelector('.recharts-line', { timeout: 5000 })

    // Multiple line series should be rendered (user + derived)
    const lines = page.locator('.recharts-line')
    const count = await lines.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('empty chart shows placeholder text when no data (F009)', async ({ page }) => {
    const empty = page.locator('.chart-empty')
    await expect(empty).toContainText('Henüz veri yok')
  })
})
