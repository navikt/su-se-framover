import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { hentTidligereGrunnlagsdataForVedtak } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import { pipe } from '~lib/fp';
import { useApiCall } from '~lib/hooks';
import { MessageFormatter } from '~lib/i18n';
import { Tilbakekrevingsavgjørelse } from '~pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import { InformasjonsRevurdering } from '~types/Revurdering';

import styles from './revurderingsoppsummeringWithSnapshot.module.less';

const RevurderingsoppsummeringWithSnapshot = (props: {
    revurdering: InformasjonsRevurdering;
    sakId: string;
    vedtakId: string;
    formatMessage: MessageFormatter<{ tilbakekreving: string }>;
}) => {
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);

    useEffect(() => {
        hentRevurderingSnapshot({ sakId: props.sakId, vedtakId: props.vedtakId });
    }, []);

    return (
        <div>
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (snapshot) => (
                        <>
                            <Revurderingoppsummering
                                revurdering={props.revurdering}
                                forrigeGrunnlagsdataOgVilkårsvurderinger={snapshot}
                            />
                            {props.revurdering.tilbakekrevingsbehandling?.avgjørelse ===
                                Tilbakekrevingsavgjørelse.TILBAKEKREV && (
                                <Alert className={styles.tilbakekrevingAlert} variant={'info'}>
                                    {props.formatMessage('tilbakekreving')}
                                </Alert>
                            )}
                        </>
                    )
                )
            )}
        </div>
    );
};

export default RevurderingsoppsummeringWithSnapshot;
