declare module 'country-data-list' {
    interface Currency {
        name: string;
        code: string;
        number: string;
    }

    export const currencies: Currency;
}
