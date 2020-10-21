import React from 'react';
import { IntlShape } from 'react-intl';

import { SøknadState } from '~features/søknad/søknad.slice';

import sharedStyles from '../../../steg-shared.module.less';
import { OppsummeringsFelt, OppsummeringsFeltAvTrygdeytelser } from '../Søknadoppsummering/Søknadoppsummering';

const InntektsOppsummering = ({ inntekt, intl }: { inntekt: SøknadState['inntekt']; intl: IntlShape }) => {
    return (
        <>
            <OppsummeringsFelt
                label={intl.formatMessage({ id: 'input.harForventetInntekt.label' })}
                verdi={inntekt.harForventetInntekt ? 'Ja' : inntekt.harForventetInntekt === false ? 'Nei' : 'Ubesvart'}
            />

            {inntekt.forventetInntekt && Number(inntekt.forventetInntekt) > 0 && (
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.forventetInntekt.label' })}
                    verdi={inntekt.forventetInntekt}
                />
            )}

            <OppsummeringsFelt
                label={intl.formatMessage({ id: 'input.tjenerPengerIUtlandet.label' })}
                verdi={
                    inntekt.tjenerPengerIUtlandet ? 'Ja' : inntekt.tjenerPengerIUtlandet === false ? 'Nei' : 'Ubesvart'
                }
            />
            {inntekt.tjenerPengerIUtlandet && (
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.tjenerPengerIUtlandetBeløp.label' })}
                    verdi={inntekt.tjenerPengerIUtlandetBeløp ? inntekt.tjenerPengerIUtlandetBeløp : 'Ubesvart'}
                />
            )}

            <OppsummeringsFelt
                label={intl.formatMessage({ id: 'input.andreYtelserINAV.label' })}
                verdi={inntekt.andreYtelserINav ? 'Ja' : inntekt.andreYtelserINav === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.andreYtelserINav && (
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.andreYtelserINavYtelse.label' })}
                    verdi={inntekt.andreYtelserINavYtelse ? inntekt.andreYtelserINavYtelse : 'Ubesvart'}
                />
            )}
            {inntekt.andreYtelserINav && (
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.andreYtelserINavBeløp.label' })}
                    verdi={inntekt.andreYtelserINavBeløp ? inntekt.andreYtelserINavBeløp : 'Ubesvart'}
                />
            )}

            <OppsummeringsFelt
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
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.søktAndreYtelserIkkeBehandletBegrunnelse.label' })}
                    verdi={
                        inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            ? inntekt.søktAndreYtelserIkkeBehandletBegrunnelse
                            : 'Ubesvart'
                    }
                />
            )}

            <OppsummeringsFelt
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
                <OppsummeringsFelt
                    label={intl.formatMessage({ id: 'input.sosialStønadBeløp.label' })}
                    verdi={inntekt.sosialStønadBeløp ? inntekt.sosialStønadBeløp : 'Ubesvart'}
                />
            )}

            <OppsummeringsFelt
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
                <OppsummeringsFeltAvTrygdeytelser
                    arr={inntekt.trygdeytelserIUtlandet}
                    labelFirstEl="Brutto beløp i lokal valuta per år"
                    labelScndEl="Hvilken ytelser?"
                    labelThirdEl="Hvem gir disse ytelsene?"
                />
            )}

            <OppsummeringsFelt
                label={intl.formatMessage({ id: 'input.mottarPensjon.label' })}
                verdi={inntekt.mottarPensjon ? 'Ja' : inntekt.mottarPensjon === false ? 'Nei' : 'Ubesvart'}
            />
            {inntekt.mottarPensjon &&
                inntekt.pensjonsInntekt.map((item, index) => (
                    <div className={sharedStyles.inputFelterDiv} key={index}>
                        <OppsummeringsFelt
                            label={intl.formatMessage({ id: 'input.pensjonsOrdning.label' })}
                            verdi={item.ordning}
                        />
                        <OppsummeringsFelt
                            label={intl.formatMessage({ id: 'input.pensjonsBeløp.label' })}
                            verdi={item.beløp}
                        />
                    </div>
                ))}
        </>
    );
};

export default InntektsOppsummering;
