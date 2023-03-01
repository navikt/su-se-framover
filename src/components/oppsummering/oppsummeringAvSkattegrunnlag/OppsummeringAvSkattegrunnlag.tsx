import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Loader } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import {
    fetchSkattegrunnlagEps as fetchSkattegrunnlagEps,
    fetchSkattegrunnlagSøker as fetchSkattegrunnlagSøker,
} from '~src/features/person/person.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { useAppSelector } from '~src/redux/Store';

import skattegrunnlagMessages from './OppsummeringAvSkattegrunnlag-nb';
import styles from './OppsummeringAvSkattegrunnlag.module.less';

const OppsummeringAvSkattegrunnlag = (props: {
    søkerFnr: string;
    skalHenteSkattegrunnlagForEPS?: Nullable<string>;
}) => {
    const { skattegrunnlagSøker, skattegrunnlagEps } = useAppSelector((state) => state.personopplysninger);
    const { formatMessage } = useI18n({ messages: skattegrunnlagMessages });
    const [skattegrunnlagSøkerStatus, hentSkattegrunnlagSøker] = useAsyncActionCreator(fetchSkattegrunnlagSøker);
    const [skattegrunnlagEpsStatus, hentSkattegrunnlagEps] = useAsyncActionCreator(fetchSkattegrunnlagEps);

    useEffect(() => {
        if (!RemoteData.isSuccess(skattegrunnlagSøker)) {
            hentSkattegrunnlagSøker({ fnr: props.søkerFnr });
        }
    }, []);
    useEffect(() => {
        console.log(RemoteData.isSuccess(skattegrunnlagEps));
        if (!RemoteData.isSuccess(skattegrunnlagEps) && props.skalHenteSkattegrunnlagForEPS) {
            hentSkattegrunnlagEps({ fnr: props.skalHenteSkattegrunnlagForEPS });
        }
    }, [props.skalHenteSkattegrunnlagForEPS]);

    console.log(props.skalHenteSkattegrunnlagForEPS);

    return (
        <div className={styles.skattegrunnlag}>
            <Heading level="2" size="xsmall">
                {formatMessage('skattegrunnlag.tittel')}
            </Heading>

            {pipe(
                skattegrunnlagSøkerStatus,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    () => <p>error</p>,
                    () => <>her skal vi vise skatteting for søkeren</>
                )
            )}
            {props.skalHenteSkattegrunnlagForEPS &&
                pipe(
                    skattegrunnlagEpsStatus,
                    RemoteData.fold(
                        () => null,
                        () => <Loader />,
                        () => <p>error</p>,
                        () => <div className={styles.eps}>Her skal vi vise skatte ting for EPS</div>
                    )
                )}
        </div>
    );
};

export default OppsummeringAvSkattegrunnlag;

/*
// Hjelpefunksjon for å håndtere att vi får ukjente tekniske navn på formue / inntekt fra skatteetaten
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
*/
