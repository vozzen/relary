import { test, expect } from '@playwright/test'

test('home page shows header and footer', async ({ page }) => {
  await page.goto('/')

  const header = page.getByRole('banner')
  await expect(header).toContainText('Rölatif Maaş')

  const footer = page.getByRole('contentinfo')
  await expect(footer).toContainText('Hiçbir veri sunuculara gönderilmez')
})
