declare module 'country-data-list' {
    interface Currency {
        name: string;
        code: string;
        number: string;
    }

    export const currencies: { all: Currency[]; [key: string]: Currency };
}
