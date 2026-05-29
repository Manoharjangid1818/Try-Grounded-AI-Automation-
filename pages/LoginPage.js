export class LoginPage{
    constructor(page)
    {
        this.page = page;//Stores browser page globally

        this.signInButton = page.getByRole('button',{ name:'Sign in'});

        this.emailTextBox = page.getByRole('textbox', { name: 'Email address or username'});

        this.continueButton = page.getByRole('button', { name: 'COntinue'});

        this.passwordTextbox = page.getByRole('textbox', { name:'Password'});
    }

    async gotoLoginPage()
    {

    await this.page.goto('https://grounded-topaz.vercel.app/');
    }

    async login(email, password)
    {
        await this.signInButton.click();
        await this.emailTextBox.fill(email);
        await this.continueButton.click();
        await this.passwordTextbox.fill(password);
        await this.continueButton.click();
    }
}