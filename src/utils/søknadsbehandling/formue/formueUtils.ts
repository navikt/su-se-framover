import { SøknadInnhold } from '~src/types/Søknad';

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
