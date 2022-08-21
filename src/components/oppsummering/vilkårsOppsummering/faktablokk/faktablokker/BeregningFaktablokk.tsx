import React from 'react';

import { useI18n } from '~src/lib/i18n';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import { FaktablokkProps } from './faktablokkUtils';

const BeregningFaktablokk = (props: FaktablokkProps) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <Faktablokk
                tittel={formatMessage('display.fraSøknad')}
                fakta={[
                    {
                        tittel: formatMessage('beregning.forventerArbeidsinntekt'),
                        verdi:
                            props.søknadInnhold.inntektOgPensjon.forventetInntekt?.toString() ??
                            formatMessage('fraSøknad.nei'),
                    },
                    {
                        tittel: formatMessage('beregning.andreYtelserINav'),
                        verdi: props.søknadInnhold.inntektOgPensjon.andreYtelserINav
                            ? `${props.søknadInnhold.inntektOgPensjon.andreYtelserINav}: ${props.søknadInnhold.inntektOgPensjon.andreYtelserINavBeløp}`
                            : formatMessage('fraSøknad.nei'),
                    },
                    {
                        tittel: formatMessage('beregning.sømtOmAndreTrygdeytelser'),
                        verdi:
                            props.søknadInnhold.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                            formatMessage('fraSøknad.nei'),
                    },
                    {
                        tittel: formatMessage('beregning.trygdeytelserIUtlandet'),
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
                            formatMessage('fraSøknad.nei')
                        ),
                    },
                    {
                        tittel: formatMessage('beregning.tjenestepensjon/pensjonssparing'),
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
                            formatMessage('fraSøknad.nei')
                        ),
                    },
                ]}
            />
            {props.søknadInnhold.ektefelle !== null && (
                <Faktablokk
                    tittel={formatMessage('beregning.es')}
                    fakta={[
                        {
                            tittel: formatMessage('beregning.es.forventerArbeidsinntekt'),
                            verdi:
                                props.søknadInnhold.ektefelle.inntektOgPensjon.forventetInntekt?.toString() ??
                                formatMessage('fraSøknad.nei'),
                        },
                        {
                            tittel: formatMessage('beregning.es.andreYtelserINav'),
                            verdi: props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINav
                                ? `${props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINav}: ${props.søknadInnhold.ektefelle.inntektOgPensjon.andreYtelserINavBeløp}`
                                : formatMessage('fraSøknad.nei'),
                        },
                        {
                            tittel: formatMessage('beregning.es.sømtOmAndreTrygdeytelser'),
                            verdi:
                                props.søknadInnhold.ektefelle.inntektOgPensjon.søktAndreYtelserIkkeBehandletBegrunnelse?.toString() ??
                                formatMessage('fraSøknad.nei'),
                        },
                        {
                            tittel: formatMessage('beregning.es.trygdeytelserIUtlandet'),
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
                                formatMessage('fraSøknad.nei')
                            ),
                        },
                        {
                            tittel: formatMessage('beregning.es.tjenestepensjon/pensjonssparing'),
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
                                formatMessage('fraSøknad.nei')
                            ),
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default BeregningFaktablokk;
