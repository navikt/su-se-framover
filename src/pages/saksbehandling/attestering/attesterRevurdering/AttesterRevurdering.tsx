import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { AttesteringsForm } from '~src/components/attestering/AttesteringsForm';
import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import {
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    TilbakekrevingsAvgjørelse,
} from '~src/types/Revurdering';
import {
    erGregulering,
    erInformasjonsRevurdering,
    erRevurderingTilAttestering,
    erRevurderingTilbakekrevingsbehandling,
    harSimulering,
    hentAvkortingFraRevurdering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import * as SharedStyles from '../sharedStyles.module.less';

import messages from './attesterRevurdering-nb';
import * as styles from './attesterRevurdering.module.less';

const AttesterRevurdering = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
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
        hentgjeldendeGrunnlagsdataOgVilkårsvurderinger
    );

    useEffect(() => {
        if (!revurdering) {
            return;
        }
        hentGrunnlagsdataOgVilkårsvurderinger({
            sakId: sakId,
            fraOgMed: revurdering.periode.fraOgMed,
            tilOgMed: revurdering.periode.tilOgMed,
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
        iverksett({ sakId: sakId, revurderingId: revurdering.id }, (iverksatteRevurdering) => {
            dispatch(sakSlice.fetchSak({ saksnummer: saksnummer.toString() }));

            const message =
                iverksatteRevurdering.tilbakekrevingsbehandling === null ||
                !(iverksatteRevurdering.tilbakekrevingsbehandling.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV)
                    ? formatMessage('attester.iverksatt')
                    : formatMessage('attester.iverksatt.med.tilbakekreving');

            Routes.navigateToSakIntroWithMessage(navigate, message, sakId);
        });
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) => {
        underkjenn({ sakId: sakId, revurderingId: revurdering.id, grunn, kommentar }, () => {
            const message = formatMessage('attester.sendtTilbake');
            Routes.navigateToSakIntroWithMessage(navigate, message, sakId);
        });
    };

    const warnings = hentWarnings(revurdering);

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
                        <OppsummeringAvInformasjonsrevurdering
                            revurdering={revurdering}
                            grunnlagsdataOgVilkårsvurderinger={gjeldendeData.grunnlagsdataOgVilkårsvurderinger}
                        />
                    </div>
                    {warnings.length === 0 &&
                        warnings.map((w) => (
                            <div key={w} className={styles.opphørsadvarsel}>
                                <Alert variant="warning">{formatMessage(w)}</Alert>
                            </div>
                        ))}
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

const hentWarnings = (revurdering: InformasjonsRevurdering): Array<keyof typeof messages> => {
    const tilbakekreving = erRevurderingTilbakekrevingsbehandling(revurdering)
        ? revurdering.tilbakekrevingsbehandling?.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV
        : false;
    const opphør = revurdering.status === InformasjonsRevurderingStatus.TIL_ATTESTERING_OPPHØRT;
    const warnings: Array<keyof typeof messages> = [];
    if (harSimulering(revurdering) && periodenInneholderTilbakekrevingOgAndreTyper(revurdering.simulering, opphør)) {
        warnings.push('tilbakekrevingFlereTyper');
    } else if (tilbakekreving && opphør) {
        warnings.push('tilbakekrevingOgOpphør');
    } else if (tilbakekreving) {
        warnings.push('tilbakekreving');
    } else if (opphør) {
        hentAvkortingFraRevurdering(revurdering)
            ? warnings.push('info.opphør.og.avkorting')
            : warnings.push('info.opphør');
    }
    if (tilbakekreving) {
        warnings.push('tilbakereving.alert.brutto.netto');
    }
    return warnings;
};

export default AttesterRevurdering;
