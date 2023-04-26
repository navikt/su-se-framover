import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';

import { hentSkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { useAppSelector } from '~src/redux/Store';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvSkattegrunnlag from '../oppsummering/oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';

const HentOgVisSkattegrunnlag = (props: { sakId: string; behandlingId: string }) => {
    const { formatMessage } = useI18n({ messages });
    const skattedataFraStore = useAppSelector((state) => state.sak.skattedata);
    const [status, hentSkattedata] = useAsyncActionCreator(hentSkattegrunnlag);

    const skattedataFraStoreEllerApiKall = useMemo(() => {
        const behandlingensSkattedataFraStore = skattedataFraStore.find(
            (data) => data.behandlingId === props.behandlingId
        );
        if (behandlingensSkattedataFraStore) {
            return RemoteData.success({
                skatteoppslagEps: behandlingensSkattedataFraStore.skatteoppslagEps,
                skatteoppslagSøker: behandlingensSkattedataFraStore.skatteoppslagSøker,
            });
        }
        if (RemoteData.isInitial(status)) {
            hentSkattedata({ sakId: props.sakId, behandlingId: props.behandlingId });
        }
        return status;
    }, [status]);

    return (
        <div>
            <Heading level="2" size="medium">
                {formatMessage('skattegrunnlag.tittel')}
            </Heading>

            {pipe(
                skattedataFraStoreEllerApiKall,
                RemoteData.fold(
                    () => <p>null</p>,
                    () => <SpinnerMedTekst text={formatMessage('skattegrunnlag.laster.søker')} />,
                    (err) => <ApiErrorAlert error={err} />,
                    (skatteoppslag) => (
                        <div className={styles.skattegrunnlagsInformasjonContainer}>
                            <OppsummeringAvSkattegrunnlag skattegrunnlag={skatteoppslag.skatteoppslagSøker} />

                            {skatteoppslag.skatteoppslagEps && (
                                <OppsummeringAvSkattegrunnlag skattegrunnlag={skatteoppslag.skatteoppslagEps} />
                            )}
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default HentOgVisSkattegrunnlag;
