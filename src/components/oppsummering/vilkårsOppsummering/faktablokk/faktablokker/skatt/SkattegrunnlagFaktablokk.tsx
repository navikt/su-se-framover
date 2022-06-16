import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Label, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import React from 'react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { SamletSkattegrunnlag, SkattegrunnlagKategori } from '~src/types/skatt/Skatt';
import { formatDateTime } from '~src/utils/date/dateUtils';

import Faktablokk from '../../Faktablokk';
import styles from '../faktablokker.module.less';

import skattegrunnlagMessages from './skattegrunnlag-nb';

export const SkattemeldingFaktablokk = (props: {
    kategori: SkattegrunnlagKategori;
    skattegrunnlagBruker: ApiResult<SamletSkattegrunnlag>;
    skattegrunnlagEPS?: ApiResult<SamletSkattegrunnlag>;
}) => {
    const { formatMessage } = useI18n({ messages: skattegrunnlagMessages });

    return (
        <div className={styles.skattegrunnlag}>
            <Heading level="2" size="xsmall">
                {formatMessage('skattegrunnlag.tittel')}
            </Heading>

            {pipe(
                props.skattegrunnlagBruker,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (error) => <SkatteApiFeilmelding tittel={formatMessage('skattegrunnlag.bruker')} error={error} />,
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
                            <SkattemeldingFaktablokkComponent
                                tittel={formatMessage('skattegrunnlag.bruker')}
                                samletSkattegrunnlag={skattegrunnlag}
                                kategori={props.kategori}
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
                        (error) => <SkatteApiFeilmelding tittel={formatMessage('skattegrunnlag.eps')} error={error} />,
                        (skattegrunnlag) => (
                            <div className={styles.eps}>
                                <SkattemeldingFaktablokkComponent
                                    tittel={formatMessage('skattegrunnlag.eps')}
                                    samletSkattegrunnlag={skattegrunnlag}
                                    kategori={props.kategori}
                                />
                            </div>
                        )
                    )
                )}
        </div>
    );
};

const SkattemeldingFaktablokkComponent = ({
    tittel,
    samletSkattegrunnlag,
    kategori,
}: {
    tittel: string;
    samletSkattegrunnlag: SamletSkattegrunnlag;
    kategori: SkattegrunnlagKategori;
}) => {
    const { formatMessage } = useI18n({ messages: skattegrunnlagMessages });
    const filtrertSkattefakta = samletSkattegrunnlag.grunnlag
        .filter((skattegrunnlag) => skattegrunnlag.beløp !== 0)
        .filter((skattegrunnlag) => skattegrunnlag.kategori.includes(kategori))
        .map((skattegrunnlag) => ({
            tittel: formatSkattTekniskMessage(skattegrunnlag.navn, formatMessage),
            verdi: skattegrunnlag.beløp.toString(),
        }));

    if (filtrertSkattefakta.length === 0)
        return (
            <div>
                <Label className={styles.overskrift} spacing>
                    {tittel}
                </Label>
                <p>{formatMessage('skattegrunnlag.tom')}</p>
            </div>
        );

    return <Faktablokk tittel={tittel} fakta={filtrertSkattefakta} />;
};

/* Hjelpefunksjon for å håndtere att vi får ukjente tekniske navn på formue / inntekt fra skatteetaten */
const formatSkattTekniskMessage = (id: string, formatMessage: (id: keyof typeof skattegrunnlagMessages) => string) => {
    try {
        return formatMessage(id as keyof typeof skattegrunnlagMessages);
    } catch (e) {
        return id;
    }
};

const SkatteApiFeilmelding = ({ tittel, error }: { tittel: string; error: ApiError | undefined }) => (
    <div>
        <Label className={styles.overskrift} spacing>
            {tittel}
        </Label>
        <ApiErrorAlert error={error} />
    </div>
);
