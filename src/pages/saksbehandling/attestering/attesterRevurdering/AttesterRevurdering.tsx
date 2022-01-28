import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import { Person } from '~api/personApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Attestering from '~components/attestering/Attestering';
import Personlinje from '~components/personlinje/Personlinje';
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
    søker: Person;
}) => {
    const urlParams = Routes.useRouteParams<typeof Routes.attesterRevurdering>();
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const history = useHistory();
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
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
            const message = intl.formatMessage({ id: 'attester.iverksatt' });
            history.push(Routes.createSakIntroLocation(message, props.sakInfo.sakId));
        });
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) => {
        underkjenn({ sakId: props.sakInfo.sakId, revurderingId: revurdering.id, grunn, kommentar }, () => {
            const message = intl.formatMessage({ id: 'attester.sendtTilbake' });
            history.push(Routes.createSakIntroLocation(message, props.sakInfo.sakId));
        });
    };

    return (
        <div className={SharedStyles.container}>
            <Personlinje søker={props.søker} sakInfo={props.sakInfo} />
            <Heading level="1" size="xlarge" className={SharedStyles.tittel}>
                {formatMessage('page.tittel')}
            </Heading>
            {pipe(
                grunnlagsdataOgVilkårsvurderinger,
                RemoteData.fold(
                    () => <Loader />,
                    () => <Loader />,
                    (err) => <ApiErrorAlert error={err} />,
                    (grunnlag) => (
                        <Attestering
                            sakId={props.sakInfo.sakId}
                            iverksett={{
                                fn: iverksettCallback,
                                status: iverksettStatus,
                            }}
                            underkjenn={{
                                fn: underkjennCallback,
                                status: underkjennStatus,
                            }}
                        >
                            <div>
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
                                        {intl.formatMessage({ id: 'knapp.brev' })}
                                        {RemoteData.isPending(hentPdfStatus) && <Loader />}
                                    </Button>
                                )}
                                {RemoteData.isFailure(hentPdfStatus) && (
                                    <Alert variant="error" className={styles.brevFeil}>
                                        {intl.formatMessage({ id: 'feil.klarteIkkeHenteBrev' })}
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
                            </div>
                        </Attestering>
                    )
                )
            )}
        </div>
    );
};

export default AttesterRevurdering;
