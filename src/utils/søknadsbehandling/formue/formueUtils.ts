import { Nullable } from '~lib/types';
import { FormueVerdier } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

function totalVerdiKjøretøy(kjøretøyArray: Array<{ verdiPåKjøretøy: number; kjøretøyDeEier: string }>) {
    return kjøretøyArray.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0);
}

export function kalkulerFormueFraSøknad(f: SøknadInnhold['formue']) {
    return [
        f.verdiPåBolig ?? 0,
        f.verdiPåEiendom ?? 0,
        totalVerdiKjøretøy(f.kjøretøy ?? []),
        Math.max((f.innskuddsBeløp ?? 0) - (f.depositumsBeløp ?? 0), 0),
        f.verdipapirBeløp ?? 0,
        f.skylderNoenMegPengerBeløp ?? 0,
        f.kontanterBeløp ?? 0,
    ].reduce((acc, formue) => acc + formue, 0);
}

export function regnUtFormueVerdier(verdier: Nullable<FormueVerdier>) {
    if (!verdier) {
        return 0;
    }

    const keyNavnForFormueVerdier: Array<keyof FormueVerdier> = [
        'verdiIkkePrimærbolig',
        'verdiEiendommer',
        'verdiKjøretøy',
        'innskudd',
        'verdipapir',
        'pengerSkyldt',
        'kontanter',
        'depositumskonto',
    ];

    const formuer = keyNavnForFormueVerdier
        .filter((keyNavn) => keyNavn !== 'depositumskonto')
        .map((keyNavn) => {
            if (keyNavn === 'innskudd') {
                return Math.max((verdier?.innskudd ?? 0) - (verdier?.depositumskonto ?? 0), 0);
            }
            return verdier[keyNavn];
        }) as number[];

    return formuer.reduce((acc, formue) => acc + formue, 0);
}
