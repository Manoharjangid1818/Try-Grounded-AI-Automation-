/**
 * Returns the current timestamp in ISO-8601 format.
 *
 * @returns {string} Current UTC timestamp.
 */
export function nowIso() {
    return new Date().toISOString();
}
