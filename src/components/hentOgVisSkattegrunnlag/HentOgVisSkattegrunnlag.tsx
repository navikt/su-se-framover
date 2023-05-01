import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import { hentNySkattegrunnlag, hentSkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator, useExclusiveCombine } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvSkattegrunnlag from '../oppsummering/oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';

const HentOgVisSkattegrunnlag = (props: {
    sakId: string;
    behandlingId: string;
    harSkattegrunnlag: boolean;
    hentBareEksisterende?: boolean;
}) => {
    const { formatMessage } = useI18n({ messages });

    const [nyStatus, ny] = useAsyncActionCreator(hentNySkattegrunnlag);
    const [hentStatus, hent] = useAsyncActionCreator(hentSkattegrunnlag);

    const status = useExclusiveCombine(nyStatus, hentStatus);

    useEffect(() => {
        if (props.hentBareEksisterende || props.harSkattegrunnlag) {
            hent({ sakId: props.sakId, behandlingId: props.behandlingId });
        } else {
            ny({ sakId: props.sakId, behandlingId: props.behandlingId });
        }
    }, []);

    return (
        <div>
            <div className={styles.tittelOgRefreshContainer}>
                <Heading level="2" size="medium">
                    {formatMessage('skattegrunnlag.tittel')}
                </Heading>
                {!props.hentBareEksisterende && (
                    <Button
                        variant="tertiary"
                        className={styles.refreshButton}
                        onClick={() => ny({ sakId: props.sakId, behandlingId: props.behandlingId })}
                        loading={RemoteData.isPending(nyStatus)}
                    >
                        <ArrowsCirclepathIcon title="Last inn skattegrunnlag på nytt" fontSize="2rem" />
                    </Button>
                )}
            </div>

            {pipe(
                status,
                RemoteData.fold(
                    () => null,
                    () => <SpinnerMedTekst text={formatMessage('skattegrunnlag.laster')} />,
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
