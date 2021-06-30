import React from 'react';

import { SøknadState } from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';

import { Oppsummeringsfelt } from './Oppsummeringsfelt';
import { OppsummeringsfeltAvKjøretøy } from './OppsummeringsfeltAvKjøretøy';

export const FormueOppsummering = ({
    formue,
    messages,
}: {
    formue: SøknadState['formue'];
    messages: Record<string, string>;
}) => {
    const intl = useI18n({ messages });

    return (
        <>
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'eierBolig.label' })}
                verdi={formue.eierBolig ? 'Ja' : formue.eierBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'depositum.label' })}
                    verdi={formue.harDepositumskonto ? 'Ja' : formue.harDepositumskonto === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'depositum.beløp' })}
                    verdi={formue.depositumsBeløp ? formue.depositumsBeløp : 'Ubesvart'}
                />
            )}
            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'depositum.kontonummer' })}
                    verdi={formue.kontonummer ? formue.kontonummer : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eierBolig.borIBolig' })}
                    verdi={formue.borIBolig ? 'Ja' : formue.borIBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eierBolig.formuePåBolig' })}
                    verdi={formue.verdiPåBolig ? formue.verdiPåBolig : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eierBolig.boligBrukesTil' })}
                    verdi={formue.boligBrukesTil ? formue.boligBrukesTil : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eiendom.eierAndreEiendommer' })}
                    verdi={formue.eierMerEnnEnBolig ? 'Ja' : formue.eierMerEnnEnBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eiendom.samledeVerdi' })}
                    verdi={formue.verdiPåEiendom ? formue.verdiPåEiendom : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'eiendom.brukesTil' })}
                    verdi={formue.eiendomBrukesTil ? formue.eiendomBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'kjøretøy.label' })}
                verdi={formue.eierKjøretøy ? 'Ja' : formue.eierKjøretøy === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierKjøretøy && (
                <OppsummeringsfeltAvKjøretøy
                    labelFirstEl={intl.formatMessage({ id: 'kjøretøy.verdi' })}
                    labelScndEl={intl.formatMessage({ id: 'kjøretøy.regNr' })}
                    arr={formue.kjøretøy}
                />
            )}

            <Oppsummeringsfelt
                label={
                    formue.harDepositumskonto
                        ? intl.formatMessage({ id: 'innskudd.pengerPåKontoInkludertDepositum' })
                        : intl.formatMessage({ id: 'innskudd.label' })
                }
                verdi={formue.harInnskuddPåKonto ? 'Ja' : formue.harInnskuddPåKonto === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harInnskuddPåKonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'innskudd.beløp' })}
                    verdi={formue.innskuddsBeløp ? formue.innskuddsBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'verdipapir.label' })}
                verdi={formue.harVerdipapir ? 'Ja' : formue.harVerdipapir === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.verdipapirBeløp && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'verdipapir.beløp' })}
                    verdi={formue.verdipapirBeløp ? formue.verdipapirBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'skylderNoenMegPenger.label' })}
                verdi={formue.skylderNoenMegPenger ? 'Ja' : formue.skylderNoenMegPenger === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.skylderNoenMegPenger && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'skylderNoenMegPenger.beløp' })}
                    verdi={formue.skylderNoenMegPengerBeløp ? formue.skylderNoenMegPengerBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'harKontanter.label' })}
                verdi={formue.harKontanter ? 'Ja' : formue.harKontanter === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harKontanter && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'harKontanter.beløp' })}
                    verdi={formue.kontanterBeløp ? formue.kontanterBeløp : 'Ubesvart'}
                />
            )}
        </>
    );
};
