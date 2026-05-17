import { test, expect } from '@playwright/test'

test.describe('Persona switching', () => {
  test('can switch between personas', async ({ page }) => {
    await page.goto('/chat')

    await expect(page.getByText('Productivity Assistant')).toBeVisible()

    await page.getByText('Travel Assistant').click()
    await expect(page.getByText('Travel Assistant').first()).toBeVisible()

    await page.getByText('Education Tutor').click()
    await expect(page.getByText('Education Tutor').first()).toBeVisible()
  })

  test('persona selection persists after page reload', async ({ page }) => {
    await page.goto('/chat')
    await page.getByText('Customer Service Bot').click()
    await page.reload()
    await expect(page.getByText('Customer Service Bot').first()).toBeVisible()
  })
})
