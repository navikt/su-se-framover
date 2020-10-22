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
                label={intl.formatMessage({ id: 'input.harForventetInntekt.label' })}
                verdi={inntekt.harForventetInntekt ? 'Ja' : inntekt.harForventetInntekt === false ? 'Nei' : 'Ubesvart'}
            />

            {inntekt.forventetInntekt && Number(inntekt.forventetInntekt) > 0 && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.forventetInntekt.label' })}
                    verdi={inntekt.forventetInntekt}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.tjenerPengerIUtlandet.label' })}
                verdi={
                    inntekt.tjenerPengerIUtlandet ? 'Ja' : inntekt.tjenerPengerIUtlandet === false ? 'Nei' : 'Ubesvart'
                }
            />
            {inntekt.tjenerPengerIUtlandet && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.tjenerPengerIUtlandetBeløp.label' })}
                    verdi={inntekt.tjenerPengerIUtlandetBeløp ? inntekt.tjenerPengerIUtlandetBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.andreYtelserINAV.label' })}
                verdi={inntekt.andreYtelserINav ? 'Ja' : inntekt.andreYtelserINav === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.andreYtelserINavYtelse.label' })}
                    verdi={inntekt.andreYtelserINavYtelse ? inntekt.andreYtelserINavYtelse : 'Ubesvart'}
                />
            )}
            {inntekt.andreYtelserINav && (
                <Oppsummeringsfelt
                    label={intl.formatMessage({ id: 'input.andreYtelserINavBeløp.label' })}
                    verdi={inntekt.andreYtelserINavBeløp ? inntekt.andreYtelserINavBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.søktAndreYtelserIkkeBehandlet.label' })}
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
                    label={intl.formatMessage({ id: 'input.søktAndreYtelserIkkeBehandletBegrunnelse.label' })}
                    verdi={
                        inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            : 'Ubesvart'
                    }
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.harMottattSosialstønad.label' })}
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
                    label={intl.formatMessage({ id: 'input.sosialStønadBeløp.label' })}
                    verdi={inntekt.sosialStønadBeløp ? inntekt.sosialStønadBeløp : 'Ubesvart'}
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.trygdeytelserIUtlandet.label' })}
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
                    labelFirstEl="Brutto beløp i lokal valuta per år"
                    labelScndEl="Hvilken ytelser?"
                    labelThirdEl="Hvem gir disse ytelsene?"
                />
            )}

            <Oppsummeringsfelt
                label={intl.formatMessage({ id: 'input.mottarPensjon.label' })}
                verdi={inntekt.mottarPensjon ? 'Ja' : inntekt.mottarPensjon === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.mottarPensjon &&
                inntekt.pensjonsInntekt.map((item, index) => (
                    <div className={sharedStyles.inputFelterDiv} key={index}>
                        <Oppsummeringsfelt
                            label={intl.formatMessage({ id: 'input.pensjonsOrdning.label' })}
                            verdi={item.ordning}
                        />
                        <Oppsummeringsfelt
                            label={intl.formatMessage({ id: 'input.pensjonsBeløp.label' })}
                            verdi={item.beløp}
                        />
                    </div>
                ))}
        </>
    );
};

export default InntektsOppsummering;
