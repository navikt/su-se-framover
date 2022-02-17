import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { AttesteringsForm } from '~components/attestering/AttesteringsForm';
import Revurderingoppsummering from '~components/revurdering/oppsummering/Revurderingoppsummering';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useApiCall, useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~redux/Store';
import { UnderkjennelseGrunn } from '~types/Behandling';
import { InformasjonsRevurdering, InformasjonsRevurderingStatus } from '~types/Revurdering';
import {
    erRevurderingTilAttestering,
    erGregulering,
    hentAvkortingFraRevurdering,
} from '~utils/revurdering/revurderingUtils';

import SharedStyles from '../sharedStyles.module.less';

import messages from './attesterRevurdering-nb';
import styles from './attesterRevurdering.module.less';

const AttesterRevurdering = (props: {
    sakInfo: { sakId: string; saksnummer: number };
    informasjonsRevurderinger: InformasjonsRevurdering[];
}) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterRevurdering>();
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const history = useHistory();
    const revurdering = props.informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);
    const [hentPdfStatus, hentPdf] = useApiCall(PdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst);
    const dispatch = useAppDispatch();
    const [iverksettStatus, iverksett] = useAsyncActionCreator(RevurderingActions.iverksettRevurdering);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(RevurderingActions.underkjennRevurdering);
    const [grunnlagsdataOgVilkårsvurderinger, hentGrunnlagsdataOgVilkårsvurderinger] = useAsyncActionCreator(
        RevurderingActions.hentGjeldendeGrunnlagsdataOgVilkårsvurderinger
    );

    useEffect(() => {
        if (!revurdering) {
            return;
        }
        hentGrunnlagsdataOgVilkårsvurderinger({
            revurderingId: revurdering.id,
            sakId: props.sakInfo.sakId,
        });
    }, [revurdering?.id]);

    if (!revurdering) {
        return (
            <div className={styles.advarselContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>
            </div>
        );
    }

    if (!erRevurderingTilAttestering(revurdering)) {
        return (
            <div className={styles.advarselContainer}>
                <Alert variant="error">{formatMessage('feil.ikkeTilAttestering')}</Alert>
            </div>
        );
    }

    const handleShowBrevClick = async () => {
        hentPdf({ sakId: props.sakInfo.sakId, revurderingId: revurdering.id, fritekst: null }, (data) => {
            window.open(URL.createObjectURL(data));
        });
    };

    const iverksettCallback = () => {
        iverksett({ sakId: props.sakInfo.sakId, revurderingId: revurdering.id }, () => {
            dispatch(sakSlice.fetchSak({ saksnummer: props.sakInfo.saksnummer.toString() }));
            const message = formatMessage('attester.iverksatt');
            history.push(Routes.createSakIntroLocation(message, props.sakInfo.sakId));
        });
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) => {
        underkjenn({ sakId: props.sakInfo.sakId, revurderingId: revurdering.id, grunn, kommentar }, () => {
            const message = formatMessage('attester.sendtTilbake');
            history.push(Routes.createSakIntroLocation(message, props.sakInfo.sakId));
        });
    };

    return pipe(
        grunnlagsdataOgVilkårsvurderinger,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (err) => <ApiErrorAlert error={err} />,
            (grunnlag) => (
                <div>
                    <Heading level="1" size="large" className={SharedStyles.tittel}>
                        {formatMessage('page.tittel')}
                    </Heading>
                    <div className={styles.oppsummeringContainer}>
                        <Revurderingoppsummering
                            revurdering={revurdering}
                            forrigeGrunnlagsdataOgVilkårsvurderinger={grunnlag}
                        />
                    </div>
                    {revurdering.skalFøreTilBrevutsending && !erGregulering(revurdering.årsak) && (
                        <Button
                            variant="secondary"
                            className={styles.brevButton}
                            type="button"
                            onClick={handleShowBrevClick}
                        >
                            {formatMessage('knapp.brev')}
                            {RemoteData.isPending(hentPdfStatus) && <Loader />}
                        </Button>
                    )}
                    {RemoteData.isFailure(hentPdfStatus) && (
                        <Alert variant="error" className={styles.brevFeil}>
                            {formatMessage('feil.klarteIkkeHenteBrev')}
                        </Alert>
                    )}

                    {revurdering.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT && (
                        <div className={styles.opphørsadvarsel}>
                            <Alert variant="warning">
                                {hentAvkortingFraRevurdering(revurdering)
                                    ? formatMessage('info.opphør.og.avkorting')
                                    : formatMessage('info.opphør')}
                            </Alert>
                        </div>
                    )}

                    <AttesteringsForm
                        sakId={props.sakInfo.sakId}
                        iverksett={{
                            fn: iverksettCallback,
                            status: iverksettStatus,
                        }}
                        underkjenn={{
                            fn: underkjennCallback,
                            status: underkjennStatus,
                        }}
                    />
                </div>
            )
        )
    );
};

export default AttesterRevurdering;
