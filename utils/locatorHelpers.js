import { expect } from '@playwright/test';

/**
 * Escapes user/test-data text before it is placed into a RegExp locator.
 *
 * @param {string} value - Literal text from test data or the app.
 * @returns {string} Text that is safe to use inside a regular expression.
 */
export function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clicks the first visible locator matching text across common app renderings.
 *
 * The Grounded AI sidebar and pickers sometimes render the same action as plain
 * text, a button, or a link depending on viewport and app state. This helper
 * keeps that fallback behavior in one place so page objects do not drift into
 * slightly different selector strategies.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance.
 * @param {string} textValue - Visible text to click.
 * @returns {Promise<void>}
 */
export async function clickFirstVisibleMatch(page, textValue) {
    const exact = page.getByText(textValue, { exact: true });
    if (await exact.isVisible({ timeout: 5000 }).catch(() => false)) {
        await exact.click({ force: true });
        return;
    }

    const escapedText = escapeRegExp(textValue);

    const byButtonLike = page
        .getByRole('button', { name: new RegExp(`^${escapedText}$`, 'i') })
        .first();

    if (await byButtonLike.isVisible({ timeout: 5000 }).catch(() => false)) {
        await byButtonLike.click({ force: true });
        return;
    }

    const byLinkLike = page
        .getByRole('link', { name: new RegExp(`^${escapedText}$`, 'i') })
        .first();

    if (await byLinkLike.isVisible({ timeout: 5000 }).catch(() => false)) {
        await byLinkLike.click({ force: true });
        return;
    }

    const contains = page.getByText(new RegExp(escapedText, 'i')).first();
    await expect(contains).toBeVisible({ timeout: 30000 });
    await contains.click({ force: true });
}
