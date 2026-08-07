import { test, expect } from '@playwright/test';

const uniqueCustomer = () => {
    const suffix = Date.now().toString().slice(-6);
    return {
        firstName: `Testy${suffix}`,
        lastName: 'McTestface',
        postCode: `E${suffix}`,
    };
}

test.describe('Bank Manager', () => {
    test.beforeEach(async ({page}) => {
        page.goto('#/manager');
    });
    
    test('a manager can add a new customer', async({page}) => {
        const customer = uniqueCustomer()

        //dialouge message
        let dialogMessage;
        page.on('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        //locator & actions
        await page.getByRole('button', { name: 'Add Customer' }).click();

        const form = page.locator('form');
        await expect(form).toBeVisible(); 

        await form.getByPlaceholder('First Name').fill(customer.firstName);
        await form.getByPlaceholder('Last Name').fill(customer.lastName);
        await form.getByPlaceholder('Post Code').fill(customer.postCode);
        console.log(customer.firstName)
        await form.getByRole('button', { name: 'Add Customer' }).click();

        //assertion
        expect(dialogMessage).toContain('Customer added successfully');
    });

    test('a manager can open an account for a seeded customer', async ({ page }) => {
        let dialogMessage;
        page.on('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        await page.getByRole('button', { name: 'Open Account' }).click();

        await page.locator('#userSelect').selectOption({ label: 'Harry Potter' });
        await page.locator('#currency').selectOption('Dollar');

        await page.getByRole('button', { name: 'Process' }).click();

        expect(dialogMessage).toContain('Account created successfully');
    });

    test('a manager can find and delete a customer they created', async ({ page }) => {
        const customer = uniqueCustomer();

        page.on('dialog', (dialog) => dialog.accept());

        await test.step('add the customer', async () => {
            await page.getByRole('button', { name: 'Add Customer' }).click();
            const form = page.locator('form');
            await form.getByPlaceholder('First Name').fill(customer.firstName);
            await form.getByPlaceholder('Last Name').fill(customer.lastName);
            await form.getByPlaceholder('Post Code').fill(customer.postCode);
            await form.getByRole('button', { name: 'Add Customer' }).click();
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
