import * as RemoteData from '@devexperts/remote-data-ts';
import { ArrowsCirclepathIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useMemo } from 'react';

import { hentNySkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import SpinnerMedTekst from '../henterInnhold/SpinnerMedTekst';
import OppsummeringAvEksternGrunnlagSkatt from '../oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';

import messages from './HentOgVisSkattegrunnlag-nb';
import styles from './HentOgVisSkattegrunnlag.module.less';

const HentOgVisSkattegrunnlag = (props: { søknadsbehandling: Søknadsbehandling }) => {
    const { formatMessage } = useI18n({ messages });

    const [nyStatus, ny] = useAsyncActionCreator(hentNySkattegrunnlag);

    //defaulter til det som er på behandlingen, hvis ikke, søker vi opp automatisk ny ved sidelast
    const status = useMemo(() => {
        if (RemoteData.isInitial(nyStatus) && props.søknadsbehandling.eksterneGrunnlag.skatt !== null) {
            return RemoteData.success(props.søknadsbehandling);
        } else if (RemoteData.isInitial(nyStatus) && props.søknadsbehandling.eksterneGrunnlag.skatt === null) {
            ny({ sakId: props.søknadsbehandling.sakId, behandlingId: props.søknadsbehandling.id });
        }
        return nyStatus;
    }, [nyStatus]);

    return (
        <div>
            <div className={styles.tittelOgRefreshContainer}>
                <Heading level="2" size="medium">
                    {formatMessage('skattegrunnlag.tittel')}
                </Heading>
                <Button
                    variant="tertiary"
                    className={styles.refreshButton}
                    onClick={() =>
                        ny({ sakId: props.søknadsbehandling.sakId, behandlingId: props.søknadsbehandling.id })
                    }
                >
                    <ArrowsCirclepathIcon title="Last inn skattegrunnlag på nytt" fontSize="2rem" />
                </Button>
            </div>

            {pipe(
                status,
                RemoteData.fold(
                    () => null,
                    () => <SpinnerMedTekst text={formatMessage('skattegrunnlag.laster')} />,
                    (err) => <ApiErrorAlert error={err} />,
                    (søknadsbehandling) => {
                        return (
                            <>
                                <OppsummeringAvEksternGrunnlagSkatt
                                    eksternGrunnlagSkatt={søknadsbehandling.eksterneGrunnlag.skatt}
                                />
                            </>
                        );
                    }
                )
            )}
        </div>
    );
};

export default HentOgVisSkattegrunnlag;
