import { test, expect } from '@playwright/test'

test.describe('Chat flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
  })

  test('shows empty state with hints', async ({ page }) => {
    await expect(page.getByText('AI Assistant')).toBeVisible()
    await expect(page.getByText('Plan my week')).toBeVisible()
  })

  test('sends a message and receives a response', async ({ page }) => {
    test.skip(!process.env.GROQ_API_KEY, 'Requires GROQ_API_KEY')

    const input = page.getByRole('textbox')
    await input.fill('Hello, how are you?')
    await page.getByLabel('Send message').click()

    await expect(page.getByText('Hello, how are you?')).toBeVisible()
    await expect(page.getByLabel('AI is typing')).toBeVisible()

    await page.waitForFunction(
      () => !document.querySelector('[aria-label="AI is typing"]'),
      { timeout: 30000 }
    )

    const messages = page.locator('[role="log"]')
    await expect(messages).toContainText(['Hello'])
  })

  test('Ctrl+Enter submits message', async ({ page }) => {
    const input = page.getByRole('textbox')
    await input.fill('Test message')
    await input.press('Control+Enter')
    await expect(page.getByText('Test message')).toBeVisible()
  })

  test('sidebar is visible by default', async ({ page }) => {
    await expect(page.getByText('Bot Persona')).toBeVisible()
    await expect(page.getByText('Suggestions')).toBeVisible()
  })

  test('sidebar can be collapsed', async ({ page }) => {
    await page.getByLabel('Collapse sidebar').click()
    await expect(page.getByText('Bot Persona')).not.toBeVisible()
  })
})
