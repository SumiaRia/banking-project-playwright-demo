import { test, expect } from '@playwright/test';
import { ManagerPage } from '../pages/manager.page';
import { AddCustomerPage } from '../pages/addCustomer.page';
import { OpenAccountPage } from '../pages/openAccount.page';

const uniqueCustomer = () => {
    const suffix = Date.now().toString().slice(-6);
    return {
        firstName: `Testy${suffix}`,
        lastName: 'McTestface',
        postCode: `E${suffix}`,
    };
}

test.describe('Bank Manager', () => {
    let dialogMessage, managerPage , customer, addCustomerPage, openAccountPage;
    test.beforeEach(async ({page}) => {
        managerPage = new ManagerPage(page);
        await managerPage.goto();
        addCustomerPage = new AddCustomerPage(page);
    });
    
    test('a manager can add a new customer', async({page}) => {
        // addCustomerPage = new AddCustomerPage(page);
        customer = uniqueCustomer()
        //dialouge message
        page.on('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        //locator & actions
        await managerPage.goToAddCustomer();
        await expect(addCustomerPage.form).toBeVisible();
        await addCustomerPage.addCustomer(customer);

        //assertion
        expect(dialogMessage).toContain('Customer added successfully');
    });

    test('a manager can open an account for a seeded customer', async ({ page }) => {
        openAccountPage = new OpenAccountPage(page);
        page.on('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });
        await managerPage.goToOpenAccount();
        await expect(openAccountPage.form).toBeVisible();
        await openAccountPage.openAccount("Harry Potter", "Dollar");
        expect(dialogMessage).toContain('Account created successfully with account Number');
    });

    test('a manager can find and delete a customer they created', async ({ page }) => {
        customer = uniqueCustomer();
        page.on('dialog', (dialog) => dialog.accept());
        await test.step('add the customer', async () => {
            await managerPage.goToAddCustomer();
            await addCustomerPage.addCustomer(customer);
            // await page.getByRole('button', { name: 'Add Customer' }).click();
            // const form = page.locator('form');
            /*await form.getByPlaceholder('First Name').fill(customer.firstName);
            await form.getByPlaceholder('Last Name').fill(customer.lastName);
            await form.getByPlaceholder('Post Code').fill(customer.postCode);
            await form.getByRole('button', { name: 'Add Customer' }).click(); */
        });

        const row = page.getByRole('row', { name: customer.firstName });

        await test.step('find them in the customers table', async () => {
            await page.getByRole('button', { name: 'Customers' }).click();
            await page.getByPlaceholder('Search Customer').fill(customer.firstName);
            await expect(row).toBeVisible();
        });

        await test.step('delete them and verify they are gone', async () => {
            await row.getByRole('button', { name: 'Delete' }).click();
            await expect(page.getByPlaceholder('Search Customer')).toBeVisible();
            await expect(row).toHaveCount(0);
        });
    });

    test('a search with no matches shows an empty table', async ({ page }) => {
        await page.getByRole('button', { name: 'Customers' }).click();

        const searchBox = page.getByPlaceholder('Search Customer');
        const customerRows = page
            .getByRole('row')
            .filter({ has: page.getByRole('button', { name: 'Delete' }) });

        await expect(customerRows).toHaveCount(5);

        await searchBox.fill('NoSuchCustomer12345');

        await expect(searchBox).toBeVisible();
        await expect(customerRows).toHaveCount(0);
    });
});
