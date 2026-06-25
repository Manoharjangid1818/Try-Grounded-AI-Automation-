/**
 * Page object for the sign-in flow used by auth setup.
 */
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

    /**
     * Opens the application entry point before starting hosted sign-in.
     *
     * @returns {Promise<void>}
     */
    async gotoLoginPage() {
        await this.page.goto('/');
    }

    /**
     * Completes the email/password portion of login before manual OTP.
     *
     * @param {string} email - Login email from environment variables.
     * @param {string} password - Login password from environment variables.
     * @returns {Promise<void>}
     */
    async login(email, password) {
        // Step 1: enter the email/username and advance to the password screen.
        await this.signInButton.click();

        await this.emailTextBox.fill(email);

        await this.continueButton.click();

        // Step 2: submit the password. OTP is handled manually in auth.setup.
        await this.passwordTextbox.fill(password);

        await this.continueButton.click();
    }
}
