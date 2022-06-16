import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Loader, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import React from 'react';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { useI18n } from '~src/lib/i18n';
import { SkattegrunnlagKategori } from '~src/types/skatt/Skatt';
import { formatDateTime } from '~src/utils/date/dateUtils';

import Faktablokk from '../Faktablokk';

import messages from './faktablokker-nb';
import styles from './faktablokker.module.less';
import { FaktablokkProps, SkattegrunnlagApiProps } from './faktablokkUtils';
import { SkatteApiFeilmelding, SkattemeldingFaktablokk } from './skatt/SkattegrunnlagFaktablokk';

type Props = FaktablokkProps & Partial<SkattegrunnlagApiProps>;
const BeregningFaktablokk = (props: Props) => {
    const skattemeldingToggle = useFeatureToggle(FeatureToggle.Skattemelding);
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

            {skattemeldingToggle && props.skattegrunnlagBruker && (
                <div className={styles.skattegrunnlag}>
                    <Heading level="2" size="xsmall">
                        {formatMessage('skattegrunnlag.tittel')}
                    </Heading>

                    {pipe(
                        props.skattegrunnlagBruker,
                        RemoteData.fold(
                            () => null,
                            () => <Loader />,
                            (error) => (
                                <SkatteApiFeilmelding tittel={formatMessage('skattegrunnlag.bruker')} error={error} />
                            ),
                            (skattegrunnlag) => (
                                <>
                                    <Label spacing size="small" className={styles.light}>
                                        {formatMessage('skattegrunnlag.lagresIkke')}
                                    </Label>
                                    <Label spacing size="small" className={classNames([styles.light, styles.italic])}>
                                        {formatMessage('skattegrunnlag.hentet', {
                                            dato: formatDateTime(skattegrunnlag.hentetDato),
                                        })}
                                    </Label>
                                    <SkattemeldingFaktablokk
                                        tittel={formatMessage('skattegrunnlag.bruker')}
                                        samletSkattegrunnlag={skattegrunnlag}
                                        kategori={SkattegrunnlagKategori.INNTEKT}
                                    />
                                </>
                            )
                        )
                    )}
                    {props.skattegrunnlagEPS &&
                        pipe(
                            props.skattegrunnlagEPS,
                            RemoteData.fold(
                                () => null,
                                () => <Loader />,
                                (error) => (
                                    <SkatteApiFeilmelding tittel={formatMessage('skattegrunnlag.eps')} error={error} />
                                ),
                                (skattegrunnlag) => (
                                    <SkattemeldingFaktablokk
                                        tittel={formatMessage('skattegrunnlag.eps')}
                                        samletSkattegrunnlag={skattegrunnlag}
                                        kategori={SkattegrunnlagKategori.INNTEKT}
                                    />
                                )
                            )
                        )}
                </div>
            )}
        </div>
    );
};

export default BeregningFaktablokk;
