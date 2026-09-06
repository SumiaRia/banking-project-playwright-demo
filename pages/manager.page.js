export class ManagerPage {
    constructor(page){
        this.page = page;
        this.tabBar = page.locator('.center');
        this.addCustomerTab = this.tabBar.getByRole('button', { name: 'Add Customer' });
        this.openAccountTab = this.tabBar.getByRole('button', { name: 'Open Account' });
        this.customersTab = this.tabBar.getByRole('button', { name: 'Customers' });
    }

    async goto(page){
        await this.page.goto('#/manager');
    }

    async goToAddCustomer(){
        await this.addCustomerTab.click();
    }

    async goToOpenAccount(){
        await this.openAccountTab.click();
    }
    async goToCustomer() {
        await this.goToCustomerTab.click();
    }

}