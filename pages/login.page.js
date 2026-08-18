export class LoginPage {
    constructor(page){
        this.page = page;
        this.customerLoginButton = page.getByRole('button', { name: 'Customer Login' });
        this.managerLoginButton = page.getByRole('button', { name: 'Bank Manager Login' });
        this.customerSelect = page.locator('#userSelect')
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true})
    }

    async goto(){
        await this.page.goto('#/login');
    }

    async loginAsCustomer(name){
        await this.customerLoginButton.click();
        await this.customerSelect.selectOption({ label: name });
        await this.loginButton.click();
    }

}