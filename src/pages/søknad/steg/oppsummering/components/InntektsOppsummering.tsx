import React from 'react';

import { SøknadState } from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/hooks';

import sharedStyles from '../../../steg-shared.module.less';

import { OppsummeringAvTrygdeytelser } from './OppsummeringAvTrygdeytelser';
import { Oppsummeringsfelt } from './Oppsummeringsfelt';

const InntektsOppsummering = ({
    inntekt,
    messages,
}: {
    inntekt: SøknadState['inntekt'];
    messages: Record<string, string>;
}) => {
    const intl = useI18n({ messages });
    return (
        <>
            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'forventerInntekt.label' })}
                verdi={inntekt.harForventetInntekt ? 'Ja' : inntekt.harForventetInntekt === false ? 'Nei' : 'Ubesvart'}
            />

            {inntekt.forventetInntekt && Number(inntekt.forventetInntekt) > 0 && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'forventerInntekt.beløp' })}
                    verdi={inntekt.forventetInntekt}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'andreYtelserINAV.label' })}
                verdi={inntekt.andreYtelserINav ? 'Ja' : inntekt.andreYtelserINav === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'andreYtelserINAV.ytelse' })}
                    verdi={inntekt.andreYtelserINavYtelse ? inntekt.andreYtelserINavYtelse : 'Ubesvart'}
                />
            )}
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'andreYtelserINAV.beløp' })}
                    verdi={inntekt.andreYtelserINavBeløp ? inntekt.andreYtelserINavBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'søktAndreYtelserIkkeBehandlet.label' })}
                verdi={
                    inntekt.søktAndreYtelserIkkeBehandlet
                        ? 'Ja'
                        : inntekt.søktAndreYtelserIkkeBehandlet === false
                        ? 'Nei'
                        : 'Ubesvart'
                }
            />

            {inntekt.søktAndreYtelserIkkeBehandlet && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'søktAndreYtelserIkkeBehandlet.begrunnelse' })}
                    verdi={
                        inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            : 'Ubesvart'
                    }
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'sosialStønad.label' })}
                verdi={
                    inntekt.harMottattSosialstønad
                        ? 'Ja'
                        : inntekt.harMottattSosialstønad === false
                        ? 'Nei'
                        : 'Ubesvart'
                }
            />
            {inntekt.harMottattSosialstønad && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'sosialStønad.beløp' })}
                    verdi={inntekt.sosialStønadBeløp ? inntekt.sosialStønadBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'trygdeytelserIUtlandet.label' })}
                verdi={
                    inntekt.harTrygdeytelserIUtlandet
                        ? 'Ja'
                        : inntekt.harTrygdeytelserIUtlandet === false
                        ? 'Nei'
                        : 'Ubesvart'
                }
            />
            {inntekt.harTrygdeytelserIUtlandet && (
                <OppsummeringAvTrygdeytelser
                    arr={inntekt.trygdeytelserIUtlandet}
                    labelFirstEl={intl.formatMessage({ id: 'trygdeytelserIUtlandet.beløp' })}
                    labelScndEl={intl.formatMessage({ id: 'trygdeytelserIUtlandet.valuta' })}
                    labelThirdEl={intl.formatMessage({ id: 'trygdeytelserIUtlandet.ytelse' })}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'mottarPensjon.label' })}
                verdi={inntekt.mottarPensjon ? 'Ja' : inntekt.mottarPensjon === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.mottarPensjon &&
                inntekt.pensjonsInntekt.map((item, index) => (
                    <div className={sharedStyles.inputFelterDiv} key={index}>
                        <Oppsummeringsfelt
                            label={intl.formatMessage({ id: 'mottarPensjon.fra' })}
                            verdi={item.ordning}
                        />
                        <Oppsummeringsfelt
                            label={intl.formatMessage({ id: 'mottarPensjon.beløp' })}
                            verdi={item.beløp}
                        />
                    </div>
                ))}
        </>
    );
};

export default InntektsOppsummering;
