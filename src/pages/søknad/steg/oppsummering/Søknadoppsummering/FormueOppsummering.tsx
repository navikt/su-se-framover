import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import React from 'react';

import { Person } from '~api/personApi';
import { SøknadState } from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';
import { Søknadsteg } from '~pages/søknad/types';

import { EndreSvar } from './EndreSvar';
import styles from './oppsummering.module.less';
import { Oppsummeringsfelt } from './Oppsummeringsfelt';
import { OppsummeringsfeltAvKjøretøy } from './OppsummeringsfeltAvKjøretøy';

export const FormueOppsummering = ({
    formue,
    søker,
    tittel,
    messages,
    søknadsteg,
}: {
    formue: SøknadState['formue'];
    søker: Person;
    tittel: string;
    messages: Record<string, string>;
    søknadsteg: Søknadsteg;
}) => {
    const intl = useI18n({ messages });

    return (
        <Ekspanderbartpanel className={styles.ekspanderbarOppsumeringSeksjon} tittel={tittel}>
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.eierDuBolig.label' })}
                verdi={formue.eierBolig ? 'Ja' : formue.eierBolig === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.depositumskonto.label' })}
                    verdi={formue.harDepositumskonto ? 'Ja' : formue.harDepositumskonto === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.depositumsBeløp.label' })}
                    verdi={formue.depositumsBeløp ? formue.depositumsBeløp : 'Ubesvart'}
                />
            )}
            {formue.harDepositumskonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.kontonummer.label' })}
                    verdi={formue.kontonummer ? formue.kontonummer : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.borIBolig.label' })}
                    verdi={formue.borIBolig ? 'Ja' : formue.borIBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.verdiPåBolig.label' })}
                    verdi={formue.verdiPåBolig ? formue.verdiPåBolig : 'Ubesvart'}
                />
            )}

            {formue.borIBolig === false && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.boligBrukesTil.label' })}
                    verdi={formue.boligBrukesTil ? formue.boligBrukesTil : 'Ubesvart'}
                />
            )}

            {formue.eierBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.eierMerEnnEnBolig.label' })}
                    verdi={formue.eierMerEnnEnBolig ? 'Ja' : formue.eierMerEnnEnBolig === false ? 'Nei' : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.verdiPåEiendom.label' })}
                    verdi={formue.verdiPåEiendom ? formue.verdiPåEiendom : 'Ubesvart'}
                />
            )}

            {formue.eierMerEnnEnBolig && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.eiendomBrukesTil.label' })}
                    verdi={formue.eiendomBrukesTil ? formue.eiendomBrukesTil : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.eierKjøretøy.label' })}
                verdi={formue.eierKjøretøy ? 'Ja' : formue.eierKjøretøy === false ? 'Nei' : 'Ubesvart'}
            />

            {formue.eierKjøretøy && (
                <OppsummeringsfeltAvKjøretøy
                    labelFirstEl={intl.formatMessage({ id: 'input.verdiPåKjøretøyTotal.label' })}
                    labelScndEl={intl.formatMessage({ id: 'input.kjøretøyDeEier.label' })}
                    arr={formue.kjøretøy}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.harInnskuddPåKonto.label' })}
                verdi={formue.harInnskuddPåKonto ? 'Ja' : formue.harInnskuddPåKonto === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harInnskuddPåKonto && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.innskuddsBeløp.label' })}
                    verdi={formue.innskuddsBeløp ? formue.innskuddsBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.harVerdipapir.label' })}
                verdi={formue.harVerdipapir ? 'Ja' : formue.harVerdipapir === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.verdipapirBeløp && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.verdipapirBeløp.label' })}
                    verdi={formue.verdipapirBeløp ? formue.verdipapirBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.skylderNoenMegPenger.label' })}
                verdi={formue.skylderNoenMegPenger ? 'Ja' : formue.skylderNoenMegPenger === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.skylderNoenMegPenger && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.skylderNoenMegPengerBeløp.label' })}
                    verdi={formue.skylderNoenMegPengerBeløp ? formue.skylderNoenMegPengerBeløp : 'Ubesvart'}
                />
            )}
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.harKontanterOver1000.label' })}
                verdi={formue.harKontanterOver1000 ? 'Ja' : formue.harKontanterOver1000 === false ? 'Nei' : 'Ubesvart'}
            />
            {formue.harKontanterOver1000 && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.kontanterBeløp.label' })}
                    verdi={formue.kontanterBeløp ? formue.kontanterBeløp : 'Ubesvart'}
                />
            )}
            <EndreSvar path={søknadsteg} søker={søker} />
        </Ekspanderbartpanel>
    );
};
