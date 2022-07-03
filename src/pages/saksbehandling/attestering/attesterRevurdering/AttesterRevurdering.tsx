import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as PdfApi from '~src/api/pdfApi';
import * as sakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { AttesteringsForm } from '~src/components/attestering/AttesteringsForm';
import Revurderingoppsummering from '~src/components/revurdering/oppsummering/Revurderingoppsummering';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import { Tilbakekrevingsavgjørelse } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import { InformasjonsRevurderingStatus, Revurdering } from '~src/types/Revurdering';
import { UnderkjennelseGrunn } from '~src/types/Søknadsbehandling';
import {
    erGregulering,
    erInformasjonsRevurdering,
    erRevurderingTilAttestering,
    harSimulering,
    hentAvkortingFraRevurdering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';

import * as SharedStyles from '../sharedStyles.module.less';

import messages from './attesterRevurdering-nb';
import * as styles from './attesterRevurdering.module.less';

const AttesterRevurdering = () => {
    const { sak } = useOutletContext<AttesteringContext>();
    const sakId = sak.id;
    const saksnummer = sak.saksnummer;
    const informasjonsRevurderinger = sak.revurderinger.filter(erInformasjonsRevurdering);
    const urlParams = Routes.useRouteParams<typeof Routes.attesterRevurdering>();
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const navigate = useNavigate();
    const revurdering = informasjonsRevurderinger.find((r) => r.id === urlParams.revurderingId);
    const [hentPdfStatus, hentPdf] = useApiCall(PdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst);
    const dispatch = useAppDispatch();
    const [iverksettStatus, iverksett] = useAsyncActionCreator(RevurderingActions.iverksettRevurdering);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(RevurderingActions.underkjennRevurdering);
    const [grunnlagsdataOgVilkårsvurderinger, hentGrunnlagsdataOgVilkårsvurderinger] = useApiCall(
        sakApi.hentgjeldendeGrunnlagsdataOgVilkårsvurderinger
    );

    useEffect(() => {
        if (!revurdering) {
            return;
        }
        hentGrunnlagsdataOgVilkårsvurderinger({
            sakId: sakId,
            fraOgMed: revurdering.periode.fraOgMed,
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
        hentPdf({ sakId: sakId, revurderingId: revurdering.id, fritekst: null }, (data) => {
            window.open(URL.createObjectURL(data));
        });
    };

    const iverksettCallback = () => {
        iverksett({ sakId: sakId, revurderingId: revurdering.id }, () => {
            dispatch(sakSlice.fetchSak({ saksnummer: saksnummer.toString() }));
            const message = formatMessage('attester.iverksatt');
            navigate(Routes.createSakIntroLocation(message, sakId));
        });
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) => {
        underkjenn({ sakId: sakId, revurderingId: revurdering.id, grunn, kommentar }, () => {
            const message = formatMessage('attester.sendtTilbake');
            navigate(Routes.createSakIntroLocation(message, sakId));
        });
    };

    const warningId = hentIdForWarning(revurdering);

    return pipe(
        grunnlagsdataOgVilkårsvurderinger,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (err) => <ApiErrorAlert error={err} />,
            (gjeldendeData) => (
                <div>
                    <Heading level="1" size="large" className={SharedStyles.tittel}>
                        {formatMessage('page.tittel')}
                    </Heading>
                    <div className={styles.oppsummeringContainer}>
                        <Revurderingoppsummering
                            revurdering={revurdering}
                            grunnlagsdataOgVilkårsvurderinger={gjeldendeData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    </div>
                    {warningId && (
                        <div className={styles.opphørsadvarsel}>
                            <Alert variant="warning">{formatMessage(warningId)}</Alert>
                        </div>
                    )}
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

                    <AttesteringsForm
                        sakId={sakId}
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

const hentIdForWarning = (revurdering: Revurdering): Nullable<keyof typeof messages> => {
    const tilbakekreving = revurdering.tilbakekrevingsbehandling?.avgjørelse === Tilbakekrevingsavgjørelse.TILBAKEKREV;
    const opphør = revurdering.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT;
    if (harSimulering(revurdering) && periodenInneholderTilbakekrevingOgAndreTyper(revurdering.simulering, opphør)) {
        return 'tilbakekrevingFlereTyper';
    } else if (tilbakekreving && opphør) {
        return 'tilbakekrevingOgOpphør';
    } else if (tilbakekreving) {
        return 'tilbakekreving';
    } else if (opphør) {
        return hentAvkortingFraRevurdering(revurdering) ? 'info.opphør.og.avkorting' : 'info.opphør';
    } else return null;
};

export default AttesterRevurdering;
