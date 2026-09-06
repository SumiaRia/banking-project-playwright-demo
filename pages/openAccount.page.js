export class OpenAccountPage {
    constructor(page){
        this.page = page;
        this.form = page.locator('form');
        this.userSelection = this.form.locator('#userSelect');
        this.currency = this.form.locator('#currency');
        this.button = this.form.getByRole('button', { name: 'Process' });
    }

    async openAccount(userName, money){
        await this.userSelection.selectOption({ label: userName });
        await this.currency.selectOption(money);
        await this.button.click();
    }
}