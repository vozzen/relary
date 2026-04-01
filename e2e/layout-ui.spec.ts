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
    await expect(headers.nth(0)).toContainText('Gelir Değişimleri')
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

  test('data visibility toggle hides and restores data (F0813)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    const toggleBtn = page.locator('.data-visibility-toggle')

    // Enter some data
    await editor.fill('01.2024 5000\n06.2024 6000')
    await expect(editor).toHaveValue('01.2024 5000\n06.2024 6000')

    // Click hide button
    await toggleBtn.click()

    // Data should be masked with XX.XX.XXXX for dates and XXXXXX for amounts
    const hiddenValue = await editor.inputValue()
    expect(hiddenValue).not.toContain('5000')
    expect(hiddenValue).toContain('XX.XX.XXXX')
    expect(hiddenValue).toContain('XXXXXX')

    // Textarea should be read-only
    await expect(editor).toHaveAttribute('readonly', '')

    // Click show button to restore
    await toggleBtn.click()

    // Original data should be restored
    await expect(editor).toHaveValue('01.2024 5000\n06.2024 6000')
    await expect(editor).not.toHaveAttribute('readonly', '')
  })

  test('saving while data is hidden preserves original data (F0813)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    const toggleBtn = page.locator('.data-visibility-toggle')
    const nameInput = page.locator('.dataset-name-input')
    const saveBtn = page.locator('.save-button')

    // Enter data and hide it
    await editor.fill('01.2024 5000\n06.2024 6000')
    await toggleBtn.click()
    await expect(editor).toHaveAttribute('readonly', '')

    // Save while hidden
    await nameInput.fill('hidden-test')
    await saveBtn.click()

    // Unhide and clear editor
    await toggleBtn.click()
    await editor.fill('')

    // Load saved dataset - should have original data, not masked
    const loadBtn = page.locator('.load-button', { hasText: 'hidden-test' })
    await loadBtn.click()
    await expect(editor).toHaveValue('01.2024 5000\n06.2024 6000')
    await expect(editor).not.toHaveAttribute('readonly', '')
  })

  test('loading data while hidden stays in hidden mode (F0813)', async ({ page }) => {
    const editor = page.locator('#timeseries-editor')
    const toggleBtn = page.locator('.data-visibility-toggle')
    const nameInput = page.locator('.dataset-name-input')
    const saveBtn = page.locator('.save-button')

    // Save a dataset first
    await editor.fill('01.2024 7000\n06.2024 8000')
    await nameInput.fill('load-hidden-test')
    await saveBtn.click()
    await editor.fill('')

    // Enter different data and hide
    await editor.fill('01.2025 1000')
    await toggleBtn.click()
    await expect(editor).toHaveAttribute('readonly', '')

    // Load while hidden - should stay hidden
    const loadBtn = page.locator('.load-button', { hasText: 'load-hidden-test' })
    await loadBtn.click()
    await expect(editor).toHaveAttribute('readonly', '')
    const hiddenValue = await editor.inputValue()
    expect(hiddenValue).toContain('XX.XX.XXXX')
    expect(hiddenValue).not.toContain('7000')

    // Toggle to show - should reveal loaded data
    await toggleBtn.click()
    await expect(editor).toHaveValue('01.2024 7000\n06.2024 8000')
    await expect(editor).not.toHaveAttribute('readonly', '')
  })
})
