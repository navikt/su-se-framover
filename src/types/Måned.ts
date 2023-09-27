import * as DateFns from 'date-fns';

import * as DateUtils from '~src/utils/date/dateUtils';

import { Periode } from './Periode';

class Måned {
    #år: string;
    #måned: string;

    static fromString(input: string): Måned {
        if (!Måned.isStringInputValid(input)) {
            throw new Error('Invalid input for måned');
        }

        const [år, måned] = input.split('-');

        return new Måned(år, måned);
    }

    static fromDate(input: Date) {
        if (!Måned.isStringInputValid(`${input.getFullYear()}-${input.getMonth() + 1}`)) {
            throw new Error('Invalid input for måned');
        }

        return new Måned(input.getFullYear().toString(), (input.getMonth() + 1).toString());
    }

    private constructor(år: string, måned: string) {
        this.#år = år;
        this.#måned = måned;
    }

    /**
     *
     * @returns måned på format yyyy-MM
     */
    toString(): string {
        return `${this.#år}-${this.#måned}`;
    }

    /**
     *
     * @returns Returnerer en periode for måneden
     *
     * @note fraOgMed er første dag i måneden
     * @note tilOgMed er siste dag i måneden
     */
    toPeriode(): Periode<string> {
        const referanceDate = new Date(`${this.#år}-${this.#måned}-01`);

        return {
            fraOgMed: DateUtils.toIsoDateOnlyString(DateFns.startOfMonth(referanceDate)),
            tilOgMed: DateUtils.toIsoDateOnlyString(DateFns.endOfMonth(referanceDate)),
        };
    }

    /**
     *
     * @param input et vilkårlig string input, som helst skal være på formatet yyyy-mm eller yyyy-mm-dd
     * @returns true hvis input er på formatet yyyy-mm eller yyyy-mm-dd
     */
    private static isStringInputValid(input: string): boolean {
        const values = input.split('-').map((value) => parseInt(value));

        /**
         * inputtet som er splittet på - skal ha lengde 2 eller 3 - 2 hvis det er yyyy-mm og 3 hvis det er yyyy-mm-dd
         * alle verdiene skal være tall
         * første verdi (som er året) skal være mellom 1900 og 2100
         * andre verdi (som er måneden) skal være mellom 1 og 12
         * vi bryr oss ikke hva dagen er
         */
        return (
            (values.length === 2 || values.length === 3) &&
            values.every((value) => !isNaN(value)) &&
            values[0] >= 1900 &&
            values[0] <= 2100 &&
            values[1] >= 1 &&
            values[1] <= 12
        );
    }
}

export default Måned;
