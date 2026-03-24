import { test, expect } from '@playwright/test'

test.describe('Layout and UI features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('footer displays application version (F0702)', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    // Version should be visible in footer matching vX.Y.Z pattern
    const versionText = footer.locator('.app-footer__version')
    await expect(versionText).toBeVisible()
    await expect(versionText).toHaveText(/^v\d+\.\d+\.\d+$/)
  })

  test('editor and storage controls are side by side (F0700)', async ({ page }) => {
    // Controls container should use grid with two columns
    const controls = page.locator('.controls-container')
    await expect(controls).toBeVisible()

    // Both sections should be present
    const editorSection = page.locator('.editor-section')
    const storageSection = page.locator('.storage-section')
    await expect(editorSection).toBeVisible()
    await expect(storageSection).toBeVisible()

    // On desktop they should be side by side (both have similar Y position)
    const editorBox = await editorSection.boundingBox()
    const storageBox = await storageSection.boundingBox()
    if (editorBox && storageBox) {
      // Y positions should be approximately equal (within 20px)
      expect(Math.abs(editorBox.y - storageBox.y)).toBeLessThan(20)
    }
  })

  test('section headers are always visible without toggle buttons (F0700)', async ({ page }) => {
    const headers = page.locator('.section-header')
    const count = await headers.count()
    expect(count).toBe(2)
    await expect(headers.nth(0)).toContainText('Veri Girişi')
    await expect(headers.nth(1)).toContainText('Kaydet/Yükle')
  })

  test('chart container covers 80% width (F007)', async ({ page }) => {
    const chartContainer = page.locator('.timeseries-chart-container')
    await expect(chartContainer).toBeVisible()

    const viewportSize = page.viewportSize()
    const box = await chartContainer.boundingBox()
    if (viewportSize && box) {
      // Should be approximately 80% of viewport width
      const expectedWidth = viewportSize.width * 0.8
      expect(box.width).toBeGreaterThan(expectedWidth * 0.9)
      expect(box.width).toBeLessThan(expectedWidth * 1.1)
    }
  })

  test('footer contains EVDS attribution link', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    const link = footer.locator('a[href="https://evds3.tcmb.gov.tr/"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveText('TCMB EVDS')
  })

  test('header sticks to top, footer sticks to bottom (F007)', async ({ page }) => {
    const header = page.getByRole('banner')
    const footer = page.getByRole('contentinfo')

    const headerBox = await header.boundingBox()
    const footerBox = await footer.boundingBox()
    const viewportSize = page.viewportSize()

    if (headerBox && footerBox && viewportSize) {
      // Header should be at the top
      expect(headerBox.y).toBeLessThan(10)
      // Footer should be near the bottom
      expect(footerBox.y + footerBox.height).toBeGreaterThan(viewportSize.height - 5)
    }
  })
})
