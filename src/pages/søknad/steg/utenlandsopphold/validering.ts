import * as DateFns from 'date-fns';

import { SøknadState } from '~src/features/søknad/søknad.slice';
import { Utenlandsopphold as UtenlandsoppholdType } from '~src/features/søknad/types';
import yup from '~src/lib/validering';

export type FormData = SøknadState['utenlandsopphold'];

const isValidUtenlandsopphold = (val: DateFns.Interval) => DateFns.isAfter(val.end, val.start);

const isTodayOrBefore = (val: string) =>
    DateFns.isBefore(DateFns.startOfDay(new Date(val)), DateFns.endOfDay(new Date()));

const isTodayOrLater = (val: string) =>
    DateFns.isAfter(DateFns.endOfDay(new Date(val)), DateFns.startOfDay(new Date()));

const reiseSchema = yup
    .object<UtenlandsoppholdType>({
        utreisedato: yup.string().required('Fyll ut utreisedato'),
        innreisedato: yup.string().required('Fyll ut innreisedato'),
    })
    .test({
        name: 'Utenlandsopphold',
        message: 'Utreisedato må være før innreisedato',
        test: (val) => {
            return isValidUtenlandsopphold({
                start: DateFns.parse(val.utreisedato, 'yyyy-MM-dd', new Date()),
                end: DateFns.parse(val.innreisedato, 'yyyy-MM-dd', new Date()),
            });
        },
    });

const testOverlappendeUtenlandsopphold: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }
    if (opphold.length < 2) {
        return true;
    }

    const oppholdIntervals = opphold.map<DateFns.Interval>((o) => ({
        start: new Date(o.utreisedato),
        end: new Date(o.innreisedato),
    }));

    return oppholdIntervals.every(
        (o1, idx1) =>
            isValidUtenlandsopphold(o1) &&
            !oppholdIntervals.some(
                (o2, idx2) => idx1 !== idx2 && isValidUtenlandsopphold(o2) && DateFns.areIntervalsOverlapping(o1, o2)
            )
    );
};

const testInnreise: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }

    return opphold.every((o) => isTodayOrBefore(o.innreisedato));
};

const testUtreise: yup.TestFunction<UtenlandsoppholdType[] | null | undefined> = (opphold) => {
    if (!opphold) {
        return false;
    }

    return opphold.every((o) => isTodayOrLater(o.utreisedato));
};

export const schema = yup.object<FormData>({
    harReistTilUtlandetSiste90dager: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du har reist til utlandet i løpet av de 90 siste dagene'),
    harReistDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('harReistTilUtlandetSiste90dager', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1, 'Legg til felt hvis det er utenlandsopphold')
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .test('Innreisedato', 'Reise du har vært på må være dagens dato eller tidligere', testInnreise)
                .required(),
            otherwise: yup.array().max(0),
        }),
    skalReiseTilUtlandetNeste12Måneder: yup
        .boolean()
        .nullable()
        .required('Fyll ut om du skal reise til utlandet i løpet av de 12 neste månedene'),
    skalReiseDatoer: yup
        .array(reiseSchema.required())
        .defined()
        .when('skalReiseTilUtlandetNeste12Måneder', {
            is: true,
            then: yup
                .array<UtenlandsoppholdType>()
                .min(1)
                .test('Overlapping', 'Utenlandsopphold kan ikke overlappe', testOverlappendeUtenlandsopphold)
                .test('Utreisedato', 'Planlagt reise må skje senere enn dagens dato', testUtreise)
                .required(),
            otherwise: yup.array().max(0),
        }),
});
