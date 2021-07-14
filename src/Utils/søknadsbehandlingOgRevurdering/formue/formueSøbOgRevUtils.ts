import * as DateFns from 'date-fns';

import { Nullable } from '~lib/types';
import { Formuegrenser } from '~types/grunnlagsdataOgVilkårsvurderinger/formue/Formuevilkår';
import { summerFormue } from '~Utils/revurdering/formue/RevurderFormueUtils';

export interface VerdierFormData {
    verdiPåBolig: string;
    verdiPåEiendom: string;
    verdiPåKjøretøy: string;
    innskuddsbeløp: string;
    verdipapir: string;
    kontanterOver1000: string;
    stårNoenIGjeldTilDeg: string;
    depositumskonto: string;
}

export const verdierId: Array<keyof VerdierFormData> = [
    'verdiPåBolig',
    'verdiPåEiendom',
    'verdiPåKjøretøy',
    'innskuddsbeløp',
    'verdipapir',
    'stårNoenIGjeldTilDeg',
    'kontanterOver1000',
    'depositumskonto',
];

export const regnUtFormDataVerdier = (verdier: Nullable<VerdierFormData>) => {
    if (!verdier) {
        return 0;
    }

    //https://trello.com/c/cKPqPVXP/513-saksbehandling-formue-depositumskonto-trekkes-ikke-ifra-innskudd-p%C3%A5-konto
    //"depositum trekkes fra innskudd på konto(men det kan ikke bli minusbeløp), så summeres innskudd på konto med resten."
    const innskudd = Math.max(
        (verdier.innskuddsbeløp ? Number(verdier.innskuddsbeløp) : 0) -
            (verdier.depositumskonto ? Number(verdier.depositumskonto) : 0),
        0
    );

    const skalAdderes = [
        verdier.verdiPåBolig,
        verdier.verdiPåEiendom,
        verdier.verdiPåKjøretøy,
        verdier.verdipapir,
        verdier.stårNoenIGjeldTilDeg,
        verdier.kontanterOver1000,
    ];

    const skalAdderesParsed = skalAdderes.map((verdi) => Number.parseInt(verdi, 0));

    const formue = [...skalAdderesParsed, innskudd];

    return summerFormue(formue);
};

//hvis fraOgMed ikke er utfyllt, eller vi ikke finner en match for fraOgMed,
//bruker vi den høyeste g-verdien som default
export const getSenesteHalvGVerdi = (fraOgMed: Nullable<Date>, formuegrenser: Formuegrenser[]) => {
    const sortert = formuegrenser.slice().sort((a: Formuegrenser, b: Formuegrenser) => {
        return Date.parse(b.gyldigFra) - Date.parse(a.gyldigFra);
    });

    if (!fraOgMed) {
        return sortert[0].beløp;
    }

    const senesteGrense = sortert.find((grense) => {
        const parsed = DateFns.startOfDay(new Date(grense.gyldigFra));
        return DateFns.isAfter(fraOgMed, parsed) || DateFns.isEqual(fraOgMed, parsed);
    });

    return senesteGrense?.beløp ?? sortert[0].beløp;
};
