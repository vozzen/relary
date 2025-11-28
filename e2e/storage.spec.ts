import { test, expect } from '@playwright/test'

test('save and load dataset via localStorage replaces current editor content (F0611)', async ({ page }) => {
  await page.goto('/')

  // Enter data
  const initialData = '01.2024 120\n03-2024 140'
  const editor = page.locator('#timeseries-editor')
  await editor.fill(initialData)

  // Provide a dataset name and save
  const nameInput = page.getByPlaceholder(/Veri seti adı|Veri/i)
  await nameInput.fill('E2E-Set-1')
  await page.getByRole('button', { name: /Kaydet/i }).click()

  // Load dataset from list by clicking its button if present
  const savedButton = page.getByRole('button', { name: 'E2E-Set-1', exact: true })
  await expect(savedButton).toBeVisible()
  await savedButton.click()

  // Modify editor with different content before load to ensure replacement
  const differentData = '02.2024 999\n04-2024 777'
  await editor.fill(differentData)

  // Load dataset again
  await savedButton.click()

  // Verify textarea equals saved content, not a merge
  await expect(editor).toHaveValue(initialData)
  await expect(editor).not.toHaveValue(differentData)
})
