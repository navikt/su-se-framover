import React from 'react';

import { SøknadState } from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/i18n';
import epsFormueMessages from '~pages/søknad/steg/formue/epsFormue/ektefellesformue-nb';
import formueMessages from '~pages/søknad/steg/formue/søkersFormue/dinformue-nb';

import { kjøretøyMessages } from '../../formue/kjøretøyInputfelter/KjøretøyInputFelter';

import { Oppsummeringsfelt } from './Oppsummeringsfelt';
import { OppsummeringsfeltAvKjøretøy } from './OppsummeringsfeltAvKjøretøy';

export const FormueOppsummering = ({
    formue,
    tilhører,
}: {
    formue: SøknadState['formue'];
    tilhører: 'søker' | 'eps';
}) => {
    const { formatMessage } =
        tilhører === 'søker'
            ? useI18n({ messages: { ...formueMessages, ...kjøretøyMessages } })
            : useI18n({ messages: { ...epsFormueMessages, ...kjøretøyMessages } });

    return (
        <>
            <Oppsummeringsfelt
                label={formatMessage('eierBolig.label')}
                verdi={formue.eierBolig ? 'Ja' : formue.eierBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierBolig === false && (
                <Oppsummeringsfelt
                    label={formatMessage('depositum.label')}
                    verdi={formue.harDepositumskonto ? 'Ja' : formue.harDepositumskonto === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={formatMessage('depositum.beløp')}
                    verdi={formue.depositumsBeløp ? formue.depositumsBeløp : 'Ubesvart'}
                />
            )}
            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={formatMessage('depositum.kontonummer')}
                    verdi={formue.kontonummer ? formue.kontonummer : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={formatMessage('eierBolig.borIBolig')}
                    verdi={formue.borIBolig ? 'Ja' : formue.borIBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={formatMessage('eierBolig.formuePåBolig')}
                    verdi={formue.verdiPåBolig ? formue.verdiPåBolig : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={formatMessage('eierBolig.boligBrukesTil')}
                    verdi={formue.boligBrukesTil ? formue.boligBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('eiendom.eierAndreEiendommer')}
                verdi={formue.eierMerEnnEnBolig ? 'Ja' : formue.eierMerEnnEnBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={formatMessage('eiendom.samledeVerdi')}
                    verdi={formue.verdiPåEiendom ? formue.verdiPåEiendom : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={formatMessage('eiendom.brukesTil')}
                    verdi={formue.eiendomBrukesTil ? formue.eiendomBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('kjøretøy.label')}
                verdi={formue.eierKjøretøy ? 'Ja' : formue.eierKjøretøy === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierKjøretøy && (
                <OppsummeringsfeltAvKjøretøy
                    labelFirstEl={formatMessage('kjøretøy.verdi')}
                    labelScndEl={formatMessage('kjøretøy.regNr')}
                    arr={formue.kjøretøy}
                />
            )}

            <Oppsummeringsfelt
                label={
                    formue.harDepositumskonto
                        ? formatMessage('innskudd.pengerPåKontoInkludertDepositum')
                        : formatMessage('innskudd.label')
                }
                verdi={formue.harInnskuddPåKonto ? 'Ja' : formue.harInnskuddPåKonto === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harInnskuddPåKonto && (
                <Oppsummeringsfelt
                    label={formatMessage('innskudd.beløp')}
                    verdi={formue.innskuddsBeløp ? formue.innskuddsBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={formatMessage('verdipapir.label')}
                verdi={formue.harVerdipapir ? 'Ja' : formue.harVerdipapir === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.verdipapirBeløp && (
                <Oppsummeringsfelt
                    label={formatMessage('verdipapir.beløp')}
                    verdi={formue.verdipapirBeløp ? formue.verdipapirBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={formatMessage('skylderNoenMegPenger.label')}
                verdi={formue.skylderNoenMegPenger ? 'Ja' : formue.skylderNoenMegPenger === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.skylderNoenMegPenger && (
                <Oppsummeringsfelt
                    label={formatMessage('skylderNoenMegPenger.beløp')}
                    verdi={formue.skylderNoenMegPengerBeløp ? formue.skylderNoenMegPengerBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={formatMessage('harKontanter.label')}
                verdi={formue.harKontanter ? 'Ja' : formue.harKontanter === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harKontanter && (
                <Oppsummeringsfelt
                    label={formatMessage('harKontanter.beløp')}
                    verdi={formue.kontanterBeløp ? formue.kontanterBeløp : 'Ubesvart'}
                />
            )}
        </>
    );
};
