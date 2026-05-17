import { test, expect } from '@playwright/test'

test.describe('Export chat', () => {
  test('export button not visible with empty chat', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByText('Export Chat')).not.toBeVisible()
  })

  test('export button visible after messages exist', async ({ page }) => {
    test.skip(!process.env.GROQ_API_KEY, 'Requires GROQ_API_KEY')

    await page.goto('/chat')
    await page.getByRole('textbox').fill('Hello')
    await page.getByLabel('Send message').click()
    await page.waitForSelector('[aria-label="AI is typing"]', { timeout: 5000 }).catch(() => {})
    await page.waitForFunction(
      () => !document.querySelector('[aria-label="AI is typing"]'),
      { timeout: 30000 }
    )
    await expect(page.getByText('Export Chat')).toBeVisible()
  })
})
