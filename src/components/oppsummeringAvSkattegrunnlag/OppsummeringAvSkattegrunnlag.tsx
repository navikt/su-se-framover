import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Label, Loader } from '@navikt/ds-react';
import classNames from 'classnames';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import { ApiError } from '~src/api/apiClient';
import { hentSkattemelding } from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { SamletSkattegrunnlag, SkattegrunnlagKategori } from '~src/types/skatt/Skatt';
import { formatDateTime } from '~src/utils/date/dateUtils';
import { formatCurrency } from '~src/utils/format/formatUtils';

import { OppsummeringPar } from '../oppsummeringspar/Oppsummeringsverdi';

import skattegrunnlagMessages from './OppsummeringAvSkattegrunnlag-nb';
import styles from './OppsummeringAvSkattegrunnlag.module.less';

const OppsummeringAvSkattegrunnlag = (props: {
    kategori: SkattegrunnlagKategori;
    søkerFnr: string;
    skalHenteSkattegrunnlagForEPS?: Nullable<string>;
}) => {
    const { formatMessage } = useI18n({ messages: skattegrunnlagMessages });
    const [skattemeldingBruker, hentSkattemeldingBruker] = useApiCall(hentSkattemelding);
    const [skattemeldingEPS, hentSkattemeldingEPS, resetSkattemeldingEPS] = useApiCall(hentSkattemelding);

    useEffect(() => {
        hentSkattemeldingBruker({ fnr: props.søkerFnr });
    }, []);

    useEffect(() => {
        resetSkattemeldingEPS();
        if (props.skalHenteSkattegrunnlagForEPS) {
            hentSkattemeldingEPS({ fnr: props.skalHenteSkattegrunnlagForEPS });
        }
    }, [props.skalHenteSkattegrunnlagForEPS]);

    return (
        <div className={styles.skattegrunnlag}>
            <Heading level="2" size="xsmall">
                {formatMessage('skattegrunnlag.tittel')}
            </Heading>

            {pipe(
                skattemeldingBruker,
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
            {skattemeldingEPS &&
                pipe(
                    skattemeldingEPS,
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

export default OppsummeringAvSkattegrunnlag;

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
        .map((skattegrunnlag) => (
            <OppsummeringPar
                key={`${skattegrunnlag.navn} - ${skattegrunnlag.beløp}`}
                label={formatSkattTekniskMessage(skattegrunnlag.navn, formatMessage)}
                verdi={formatCurrency(skattegrunnlag.beløp, { numDecimals: 0 })}
            />
        ));

    return (
        <div>
            <Heading size="small">{tittel}</Heading>
            {filtrertSkattefakta.length === 0 ? (
                <OppsummeringPar label={tittel} verdi={formatMessage('skattegrunnlag.tom')} />
            ) : (
                filtrertSkattefakta.map((it) => it)
            )}
        </div>
    );
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