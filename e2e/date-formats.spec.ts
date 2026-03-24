import { test, expect } from '@playwright/test'

test.describe('Date format acceptance (F0603)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('accepts D.M.YYYY format', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('1.1.2024 100\n15.6.2024 200')

    // Valid input → green border
    await expect(editor).toHaveClass(/is-valid/)
  })

  test('accepts D-M-YYYY format', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('1-1-2024 100\n15-6-2024 200')

    await expect(editor).toHaveClass(/is-valid/)
  })

  test('accepts MM-YYYY format', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01-2024 100\n06-2024 200')

    await expect(editor).toHaveClass(/is-valid/)
  })

  test('accepts MM.YYYY format', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n06.2024 200')

    await expect(editor).toHaveClass(/is-valid/)
  })

  test('marks invalid format with red border', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('2024/01/01 100')

    await expect(editor).toHaveClass(/is-invalid/)
  })

  test('mixed valid formats all accepted', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    await editor.fill('01.2024 100\n15.02.2024 120\n3-2024 130\n5-6-2024 150')

    await expect(editor).toHaveClass(/is-valid/)
  })
})
