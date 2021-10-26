import React from 'react';

import epsInntektMessages from '~/pages/søknad/steg/inntekt/epsInntekt/inntekt-nb';
import { SøknadState } from '~features/søknad/søknad.slice';
import { useI18n } from '~lib/i18n';
import inntektMessages from '~pages/søknad/steg/inntekt/søkersInntekt/inntekt-nb';

import sharedStyles from '../../../steg-shared.module.less';
import { pensjonsinntekterMessages } from '../../inntekt/Pensjonsinntekter';
import { trygdeytelserMessages } from '../../inntekt/TrygdeytelserInputs/TrygdeytelserInputs';

import { OppsummeringAvTrygdeytelser } from './OppsummeringAvTrygdeytelser';
import { Oppsummeringsfelt } from './Oppsummeringsfelt';

const InntektsOppsummering = ({
    inntekt,
    tilhører,
}: {
    inntekt: SøknadState['inntekt'];
    tilhører: 'søker' | 'eps';
}) => {
    const { formatMessage } =
        tilhører === 'søker'
            ? useI18n({ messages: { ...inntektMessages, ...trygdeytelserMessages, ...pensjonsinntekterMessages } })
            : useI18n({ messages: { ...epsInntektMessages, ...trygdeytelserMessages, ...pensjonsinntekterMessages } });

    return (
        <>
            <Oppsummeringsfelt
                label={formatMessage('forventerInntekt.label')}
                verdi={inntekt.harForventetInntekt ? 'Ja' : inntekt.harForventetInntekt === false ? 'Nei' : 'Ubesvart'}
            />

            {inntekt.forventetInntekt && Number(inntekt.forventetInntekt) > 0 && (
                <Oppsummeringsfelt label={formatMessage('forventerInntekt.beløp')} verdi={inntekt.forventetInntekt} />
            )}

            <Oppsummeringsfelt
                label={formatMessage('andreYtelserINAV.label')}
                verdi={inntekt.andreYtelserINav ? 'Ja' : inntekt.andreYtelserINav === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={formatMessage('andreYtelserINAV.ytelse')}
                    verdi={inntekt.andreYtelserINavYtelse ? inntekt.andreYtelserINavYtelse : 'Ubesvart'}
                />
            )}
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={formatMessage('andreYtelserINAV.beløp')}
                    verdi={inntekt.andreYtelserINavBeløp ? inntekt.andreYtelserINavBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('søktAndreYtelserIkkeBehandlet.label')}
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
                    label={formatMessage('søktAndreYtelserIkkeBehandlet.begrunnelse')}
                    verdi={
                        inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            : 'Ubesvart'
                    }
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('sosialstønad.label')}
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
                    label={formatMessage('sosialstønad.beløp')}
                    verdi={inntekt.sosialStønadBeløp ? inntekt.sosialStønadBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('trygdeytelserIUtlandet.label')}
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
                    labelFirstEl={formatMessage('trygdeytelserIUtlandet.beløp')}
                    labelScndEl={formatMessage('trygdeytelserIUtlandet.valuta')}
                    labelThirdEl={formatMessage('trygdeytelserIUtlandet.ytelse')}
                />
            )}

            <Oppsummeringsfelt
                label={formatMessage('mottarPensjon.label')}
                verdi={inntekt.mottarPensjon ? 'Ja' : inntekt.mottarPensjon === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.mottarPensjon && (
                <ul>
                    {inntekt.pensjonsInntekt.map((item, index) => (
                        <li className={sharedStyles.oppsummeringDetaljrad} key={index}>
                            <Oppsummeringsfelt label={formatMessage('mottarPensjon.fra')} verdi={item.ordning} />
                            <Oppsummeringsfelt label={formatMessage('mottarPensjon.beløp')} verdi={item.beløp} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default InntektsOppsummering;
