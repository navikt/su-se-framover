import { SøknadState } from '~src/features/søknad/søknad.slice';

import { Oppsummeringsfelt } from './Oppsummeringsfelt';
import { OppsummeringsfeltAvKjøretøy } from './OppsummeringsfeltAvKjøretøy';

export const FormueOppsummering = ({
    formue,
    tilhører,
}: {
    formue: SøknadState['formue'];
    tilhører: 'søker' | 'eps';
}) => {
    return (
        <>
            <Oppsummeringsfelt
                label={tilhører === 'søker' ? 'Eier du en bolig?' : 'Eier ektefelle/samboer en bolig?'}
                verdi={formue.eierBolig ? 'Ja' : formue.eierBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierBolig === false && (
                <Oppsummeringsfelt
                    label={
                        tilhører === 'søker'
                            ? 'Har du en depositumskonto som leietaker?'
                            : 'Har ektefelle/samboer en depositumskonto som leietaker?'
                    }
                    verdi={formue.harDepositumskonto ? 'Ja' : formue.harDepositumskonto === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={'Beløp på depositumskonto'}
                    verdi={formue.depositumsBeløp ? formue.depositumsBeløp : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={tilhører === 'søker' ? 'Bor du i boligen?' : 'Bor ektefelle/samboer i boligen?'}
                    verdi={formue.borIBolig ? 'Ja' : formue.borIBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={'Boligens formueverdi'}
                    verdi={formue.verdiPåBolig ? formue.verdiPåBolig : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={'Hva brukes boligen til?'}
                    verdi={formue.boligBrukesTil ? formue.boligBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Eier du andre eiendommer i Norge eller i andre land?'
                        : 'Eier ektefelle/samboer andre eiendommer i Norge eller i andre land?'
                }
                verdi={formue.eierMerEnnEnBolig ? 'Ja' : formue.eierMerEnnEnBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={'Eiendommenes samlede verdi'}
                    verdi={formue.verdiPåEiendom ? formue.verdiPåEiendom : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={'Hva brukes eiendommene til?'}
                    verdi={formue.eiendomBrukesTil ? formue.eiendomBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Eier du bil, campingvogn eller andre kjøretøy?'
                        : 'Eier ektefelle/samboer bil, campingvogn eller andre kjøretøy?'
                }
                verdi={formue.eierKjøretøy ? 'Ja' : formue.eierKjøretøy === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierKjøretøy && (
                <OppsummeringsfeltAvKjøretøy
                    labelFirstEl={'Kjøretøyets verdi'}
                    labelScndEl={'Registreringsnummer'}
                    arr={formue.kjøretøy}
                />
            )}

            <Oppsummeringsfelt
                label={
                    formue.harDepositumskonto
                        ? tilhører === 'søker'
                            ? 'Har du penger på konto (inkludert depositumskonto)?'
                            : 'Har ektefelle/samboer penger på konto (inkludert depositumskonto)?'
                        : tilhører === 'søker'
                          ? 'Har du penger på konto?'
                          : 'Har ektefelle/samboer penger på konto?'
                }
                verdi={formue.harInnskuddPåKonto ? 'Ja' : formue.harInnskuddPåKonto === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harInnskuddPåKonto && (
                <Oppsummeringsfelt
                    label={'Hvor mye penger er det på konto?'}
                    verdi={formue.innskuddsBeløp ? formue.innskuddsBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Har du aksjer, aksjefond eller verdipapir?'
                        : 'Har ektefelle/samboer aksjer, aksjefond eller verdipapir?'
                }
                verdi={formue.harVerdipapir ? 'Ja' : formue.harVerdipapir === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.verdipapirBeløp && (
                <Oppsummeringsfelt
                    label={'Hvor mye penger er dette verdt?'}
                    verdi={formue.verdipapirBeløp ? formue.verdipapirBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Skylder noen deg mer enn 1000 kr?'
                        : 'Skylder noen ektefelle/samboer mer enn 1000 kr?'
                }
                verdi={formue.skylderNoenMegPenger ? 'Ja' : formue.skylderNoenMegPenger === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.skylderNoenMegPenger && (
                <Oppsummeringsfelt
                    label={tilhører === 'søker' ? 'Hvor mye skylder de deg?' : 'Hvor mye skylder de ektefelle/samboer?'}
                    verdi={formue.skylderNoenMegPengerBeløp ? formue.skylderNoenMegPengerBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={
                    tilhører === 'søker'
                        ? 'Har du mer enn 1000 kroner i kontanter?'
                        : 'Har ektefelle/samboer mer enn 1000 kroner i kontanter?'
                }
                verdi={formue.harKontanter ? 'Ja' : formue.harKontanter === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harKontanter && (
                <Oppsummeringsfelt
                    label={tilhører === 'søker' ? 'Hvor mye penger har du?' : 'Hvor mye penger har ektefelle/samboer?'}
                    verdi={formue.kontanterBeløp ? formue.kontanterBeløp : 'Ubesvart'}
                />
            )}
        </>
    );
};
