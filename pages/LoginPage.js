export class LoginPage {

    constructor(page) {

        this.page = page;

        this.signInButton = page.getByRole('button', {
            name: 'Sign in'
        });

        this.emailTextBox = page.getByRole('textbox', {
            name: 'Email address or username'
        });

        this.continueButton = page.getByRole('button', {
            name: /Continue/i
        });

        this.passwordTextbox = page.getByRole('textbox', {
            name: 'Password'
        });
    }

    async gotoLoginPage() {

        await this.page.goto('/');
    }

    async login(email, password) {

        await this.signInButton.click();

        await this.emailTextBox.fill(email);

        await this.continueButton.click();

        await this.passwordTextbox.fill(password);

        await this.continueButton.click();
    }
}