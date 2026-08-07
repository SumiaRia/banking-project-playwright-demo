import { test, expect } from '@playwright/test';

test.describe('Customer Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('#/login');
    });

    test('login page offers both customer and manager entry points', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Customer Login' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Bank Manager Login' })).toBeVisible();
    });

    test('a customer can log in and reach their account page', async ({ page }) => {
        await page.getByRole('button', { name: 'Customer Login' }).click();
        await page.locator('#userSelect').selectOption({ label: 'Harry Potter' });
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL(/#\/account/);
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    test('the login button stays hidden until a customer is chosen', async ({ page }) => {
        await page.getByRole('button', { name: 'Customer Login' }).click();
        await expect(page.locator('#userSelect')).toBeVisible();
        const loginButton = page.getByRole('button', { name: 'Login' , exact: true})
        await expect(loginButton).toBeHidden();
        await page.locator('#userSelect').selectOption({ label: 'Hermoine Granger' });
        await expect(loginButton).toBeVisible();
    });
});