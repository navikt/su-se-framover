import { SøknadState } from './søknad.slice';

export const toFormue = (formue: SøknadState['formue']) => {
    return {
        borIBolig: formue.eierBolig ? formue.borIBolig : null,
        verdiPåBolig: formue.borIBolig ? null : Number(formue.verdiPåBolig),
        boligBrukesTil: formue.borIBolig ? null : formue.boligBrukesTil,

        depositumsBeløp: formue.harDepositumskonto ? Number(formue.depositumsBeløp) : null,
        kontonummer: formue.harDepositumskonto ? formue.kontonummer : null,

        verdiPåEiendom: formue.eierMerEnnEnBolig ? Number(formue.verdiPåEiendom) : null,
        eiendomBrukesTil: formue.eierMerEnnEnBolig ? formue.eiendomBrukesTil : null,

        kjøretøy: formue.kjøretøy.map((p) => ({ ...p, verdiPåKjøretøy: Number(p.verdiPåKjøretøy) })),

        innskuddsBeløp: formue.harInnskuddPåKonto ? Number(formue.innskuddsBeløp) : null,
        verdipapirBeløp: formue.harVerdipapir ? Number(formue.verdipapirBeløp) : null,

        skylderNoenMegPengerBeløp: formue.skylderNoenMegPenger ? Number(formue.skylderNoenMegPengerBeløp) : null,
        kontanterBeløp: formue.harKontanterOver1000 ? Number(formue.kontanterBeløp) : null,
    };
};
