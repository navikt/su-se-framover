import { Label } from '@navikt/ds-react';
import React from 'react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { useI18n } from '~src/lib/i18n';
import { SamletSkattegrunnlag, SkattegrunnlagKategori } from '~src/types/skatt/Skatt';

import Faktablokk from '../../Faktablokk';
import styles from '../faktablokker.module.less';

import skattegrunnlagMessages from './skattegrunnlag-nb';

export const SkattemeldingFaktablokk = ({
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
                <p>{formatMessage('skattegrunnlag.empty')}</p>
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

export const SkatteApiFeilmelding = ({ tittel, error }: { tittel: string; error: ApiError | undefined }) => (
    <div>
        <Label className={styles.overskrift} spacing>
            {tittel}
        </Label>
        <ApiErrorAlert error={error} />
    </div>
);
