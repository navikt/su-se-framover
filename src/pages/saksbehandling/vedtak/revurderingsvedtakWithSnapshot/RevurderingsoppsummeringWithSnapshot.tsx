import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import * as DokumentApi from '~src/api/dokumentApi';
import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { InformasjonsRevurdering } from '~src/types/Revurdering';
import { getBlob } from '~src/utils/dokumentUtils';

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

    const [hentDokumenterStatus, hentDokumenter] = useApiCall(DokumentApi.hentDokumenter);

    return (
        <div>
            {pipe(
                revurderingSnapshot,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (error) => <ApiErrorAlert error={error} />,
                    (snapshot) => (
                        <div className={styles.oppsummeringsContainer}>
                            <OppsummeringAvInformasjonsrevurdering
                                revurdering={props.revurdering}
                                grunnlagsdataOgVilkårsvurderinger={snapshot}
                            />
                            {RemoteData.isFailure(hentDokumenterStatus) && (
                                <ApiErrorAlert error={hentDokumenterStatus.error} />
                            )}
                            <Button
                                className={styles.brevButton}
                                variant="secondary"
                                onClick={() => {
                                    hentDokumenter(
                                        {
                                            id: props.vedtakId,
                                            idType: DokumentIdType.Vedtak,
                                        },
                                        (dokumenter) => window.open(URL.createObjectURL(getBlob(dokumenter[0])))
                                    );
                                }}
                            >
                                {formatMessage('knapp.seBrev')}
                            </Button>
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default RevurderingsoppsummeringWithSnapshot;
