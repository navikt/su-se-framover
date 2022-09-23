import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import { erRevurderingTilbakekreving } from '~src/utils/revurdering/revurderingUtils';

import messages from '../vedtaksoppsummering-nb';

import * as styles from './revurderingsoppsummeringWithSnapshot.module.less';

const RevurderingsoppsummeringWithSnapshot = (props: {
    revurdering: InformasjonsRevurdering;
    sakId: string;
    vedtakId: string;
}) => {
    const [revurderingSnapshot, hentRevurderingSnapshot] = useApiCall(hentTidligereGrunnlagsdataForVedtak);
    const { formatMessage } = useI18n({ messages });
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
                            <OppsummeringAvInformasjonsrevurdering
                                revurdering={props.revurdering}
                                grunnlagsdataOgVilkårsvurderinger={snapshot}
                            />
                            {erRevurderingTilbakekreving(props.revurdering) && (
                                <Alert className={styles.tilbakekrevingAlert} variant={'info'}>
                                    {formatMessage('tilbakekreving')}
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
