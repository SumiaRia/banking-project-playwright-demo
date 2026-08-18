import { test, expect } from '@playwright/test';
import {LoginPage} from '../pages/login.page.js';

test.describe('Customer Login', () => {
    let loginPage;
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('login page offers both customer and manager entry points', async ({ page }) => {
        await expect(loginPage.customerLoginButton).toBeVisible();
        await expect(loginPage.managerLoginButton).toBeVisible();
    });

    test('a customer can log in and reach their account page', async ({ page }) => {
        await loginPage.loginAsCustomer('Harry Potter');
        await expect(page).toHaveURL(/#\/account/);
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });

    test('the login button stays hidden until a customer is chosen', async ({ page }) => {
        await loginPage.customerLoginButton.click();
        await expect(loginPage.managerLoginButton).toBeVisible();
        // const loginButton = page.getByRole('button', { name: 'Login' , exact: true})
        await expect(loginPage.loginButton).toBeHidden();
        await loginPage.customerSelect.selectOption({ label: 'Hermoine Granger' });
        await expect(loginPage.loginButton).toBeVisible();
    });
});