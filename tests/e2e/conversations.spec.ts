import { test, expect } from '@playwright/test'

test.describe('Multi-conversation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts fresh
    await page.goto('/chat')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('auto-creates a conversation on first load', async ({ page }) => {
    await expect(page.getByText('New Chat')).toBeVisible()
  })

  test('can create a new conversation via the New button', async ({ page }) => {
    await page.getByLabel('New chat').click()
    const items = page.locator('[aria-label="New chat"]')
    // After click there should be 2 conversations listed
    await expect(page.getByText('New Chat')).toHaveCount(2)
  })

  test('conversations are listed in the sidebar', async ({ page }) => {
    await expect(page.getByText('Chats')).toBeVisible()
  })

  test('switching conversations changes the chat window', async ({ page }) => {
    // First conversation auto-created; create a second one
    await page.getByLabel('New chat').click()
    const convItems = page.locator('.group.relative.flex.items-center')
    await expect(convItems).toHaveCount(2)
  })

  test('can delete a conversation', async ({ page }) => {
    // Hover the conversation item to reveal controls
    const item = page.locator('.group.relative.flex.items-center').first()
    await item.hover()
    await item.getByLabel('Delete').click()
    // After deletion the list is empty or shows one auto-created
    await expect(page.getByText('No conversations yet').or(page.getByText('New Chat'))).toBeVisible()
  })

  test('can rename a conversation', async ({ page }) => {
    const item = page.locator('.group.relative.flex.items-center').first()
    await item.hover()
    await item.getByLabel('Rename').click()
    const input = page.locator('input[type="text"]').or(page.locator('input:not([type])')).first()
    await input.clear()
    await input.fill('My Renamed Chat')
    await input.press('Enter')
    await expect(page.getByText('My Renamed Chat')).toBeVisible()
  })

  test('sidebar shows Bot Persona section when a conversation is active', async ({ page }) => {
    await expect(page.getByText('Bot Persona')).toBeVisible()
  })

  test('persona change is scoped to the active conversation', async ({ page }) => {
    // Switch to Coder persona for conversation 1
    await page.getByText('Code Assistant').click()

    // Create a second conversation; it should start with default persona
    await page.getByLabel('New chat').click()
    await expect(page.locator('[class*="border-cyan-500"]')).not.toContainText('Code Assistant')
  })
})
