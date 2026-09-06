export class AddCustomerPage {
    constructor(page){
        this.page = page;
        this.form = page.locator('form');
        this.firstNameInput = this.form.getByPlaceholder('First Name');
        this.lastNameInput = this.form.getByPlaceholder('Last Name');
        this.postCodeInput = this.form.getByPlaceholder('Post Code');
        this.submitButton = this.form.getByRole('button', { name: 'Add Customer' });
    }

    async addCustomer({firstName, lastName, postCode}){
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.postCodeInput.fill(postCode)
        await this.submitButton.click();
    }

    


}