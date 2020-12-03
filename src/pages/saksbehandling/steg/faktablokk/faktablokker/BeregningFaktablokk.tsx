import React from 'react';

import { useI18n } from '~lib/hooks';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const BeregningFaktablokk = (props: FaktablokkProps) => {
    const intl = useI18n({ messages });

    return (
        <div>
            <Faktablokk
                tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                brukUndertittel={props.brukUndertittel}
                fakta={[
                    {
                        tittel: intl.formatMessage({ id: 'beregning.forventerArbeidsinntekt' }),
                        verdi:
                            props.søknadInnhold.inntektOgPensjon.forventetInntekt?.toString() ??
                            intl.formatMessage({ id: 'fraSøknad.nei' }),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'beregning.andreYtelserINav' }),
                        verdi: props.søknadInnhold.inntektOgPensjon.andreYtelserINav
                            ? `${intl.formatMessage({ id: 'fraSøknad.nei' })}, ${
                                  props.søknadInnhold.inntektOgPensjon.andreYtelserINav
                              }: ${props.søknadInnhold.inntektOgPensjon.andreYtelserINavBeløp}`
                            : intl.formatMessage({ id: 'fraSøknad.nei' }),
                    },
                    {
                        tittel: intl.formatMessage({ id: 'beregning.sømtOmAndreTrygdeytelser' }),
                        verdi:
                            props.søknadInnhold.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                            intl.formatMessage({ id: 'fraSøknad.nei' }),
                    },
                    {
                        tittel: intl.formatMessage({
                            id: 'beregning.mottattSosialstønadSiste3måneder',
                        }),
                        verdi:
                            props.søknadInnhold.inntektOgPensjon.sosialstønadBeløp?.toString() ??
                            intl.formatMessage({ id: 'fraSøknad.nei' }),
                    },
                    {
                        tittel: intl.formatMessage({
                            id: 'beregning.trygdeytelserIUtlandet',
                        }),
                        verdi: props.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet?.length ? (
                            <>
                                {props.søknadInnhold.inntektOgPensjon.trygdeytelserIUtlandet.map((ytelse, index) => (
                                    <div key={index}>
                                        <p>Beløp: {ytelse.beløp} i lokal valuta</p>
                                        <p>Valuta: {ytelse.valuta}</p>
                                        <p>Type: {ytelse.type}</p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            intl.formatMessage({ id: 'fraSøknad.nei' })
                        ),
                    },
                    {
                        tittel: intl.formatMessage({
                            id: 'beregning.tjenestepensjon/pensjonssparing',
                        }),
                        verdi: props.søknadInnhold.inntektOgPensjon.pensjon?.length ? (
                            <>
                                {props.søknadInnhold.inntektOgPensjon.pensjon.map((p, index) => (
                                    <div key={index}>
                                        <p>Beløp: {p.beløp}</p>
                                        <p>Ordning: {p.ordning}</p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            intl.formatMessage({ id: 'fraSøknad.nei' })
                        ),
                    },
                ]}
            />
            {props.søknadInnhold.ektefelle !== null && (
                <Faktablokk
                    tittel={intl.formatMessage({ id: 'beregning.es' })}
                    fakta={[
                        {
                            tittel: intl.formatMessage({
                                id: 'beregning.es.forventerArbeidsinntekt',
                            }),
                            verdi:
                                props.søknadInnhold.ektefelle.inntektOgPensjon.forventetInntekt?.toString() ??
                                intl.formatMessage({ id: 'fraSøknad.nei' }),
                        },
                        {
                            tittel: intl.formatMessage({ id: 'beregning.es.andreYtelserINav' }),
                            verdi: props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINav
                                ? `${props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINav}: ${props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINavBeløp}`
                                : intl.formatMessage({ id: 'fraSøknad.nei' }),
                        },
                        {
                            tittel: intl.formatMessage({
                                id: 'beregning.es.sømtOmAndreTrygdeytelser',
                            }),
                            verdi:
                                props.søknadInnhold.ektefelle.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                                intl.formatMessage({ id: 'fraSøknad.nei' }),
                        },
                        {
                            tittel: intl.formatMessage({
                                id: 'beregning.es.mottattSosialstønadSiste3måneder',
                            }),
                            verdi:
                                props.søknadInnhold.ektefelle.inntektOgPensjon.sosialstønadBeløp?.toString() ??
                                intl.formatMessage({ id: 'fraSøknad.nei' }),
                        },
                        {
                            tittel: intl.formatMessage({
                                id: 'beregning.es.trygdeytelserIUtlandet',
                            }),
                            verdi: props.søknadInnhold.ektefelle.inntektOgPensjon.trygdeytelserIUtlandet?.length ? (
                                <>
                                    {props.søknadInnhold.ektefelle.inntektOgPensjon.trygdeytelserIUtlandet.map(
                                        (ytelse, index) => (
                                            <div key={index}>
                                                <p>Beløp: {ytelse.beløp} i lokal valuta</p>
                                                <p>Valuta: {ytelse.valuta}</p>
                                                <p>Type: {ytelse.type}</p>
                                            </div>
                                        )
                                    )}
                                </>
                            ) : (
                                intl.formatMessage({ id: 'fraSøknad.nei' })
                            ),
                        },
                        {
                            tittel: intl.formatMessage({
                                id: 'beregning.es.tjenestepensjon/pensjonssparing',
                            }),
                            verdi: props.søknadInnhold.ektefelle.inntektOgPensjon.pensjon?.length ? (
                                <>
                                    {props.søknadInnhold.ektefelle.inntektOgPensjon.pensjon.map((p, index) => (
                                        <div key={index}>
                                            <p>Beløp: {p.beløp}</p>
                                            <p>Ordning: {p.ordning}</p>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                intl.formatMessage({ id: 'fraSøknad.nei' })
                            ),
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default BeregningFaktablokk;
