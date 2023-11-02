import * as RemoteData from '@devexperts/remote-data-ts';
import { Accordion, Alert, Button, Heading, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { AttesteringsForm } from '~src/components/forms/attesteringForm/AttesteringsForm';
import OppsummeringAvInformasjonsrevurdering from '~src/components/oppsummering/oppsummeringAvRevurdering/informasjonsrevurdering/OppsummeringAvInformasjonsrevurdering';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummeringspanel/Oppsummeringspanel';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import sharedMessages from '~src/pages/saksbehandling/revurdering/revurdering-nb';
import { useAppDispatch } from '~src/redux/Store';
import { UnderkjennelseGrunn } from '~src/types/Behandling';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import {
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    TilbakekrevingsAvgjørelse,
    Valg,
} from '~src/types/Revurdering';
import {
    erRevurderingTilAttestering,
    erRevurderingTilbakekrevingsbehandling,
    harSimulering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import { VisDokumenter } from '../../dokumenter/DokumenterPage';

import messages from './attesterRevurdering-nb';
import * as styles from './attesterRevurdering.module.less';

const AttesterRevurdering = (props: {
    sakInfo: {
        id: string;
        nummer: number;
    };
    revurdering: InformasjonsRevurdering;
}) => {
    const { formatMessage } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const navigate = useNavigate();

    const [hentPdfStatus, hentPdf] = useApiCall(PdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst);
    const dispatch = useAppDispatch();
    const [iverksettStatus, iverksett] = useAsyncActionCreator(RevurderingActions.iverksettRevurdering);
    const [underkjennStatus, underkjenn] = useAsyncActionCreator(RevurderingActions.underkjennRevurdering);
    const [grunnlagsdataOgVilkårsvurderinger, hentGrunnlagsdataOgVilkårsvurderinger] = useApiCall(
        hentgjeldendeGrunnlagsdataOgVilkårsvurderinger,
    );

    useEffect(() => {
        if (!props.revurdering) {
            return;
        }
        hentGrunnlagsdataOgVilkårsvurderinger({
            sakId: props.sakInfo.id,
            fraOgMed: props.revurdering.periode.fraOgMed,
            tilOgMed: props.revurdering.periode.tilOgMed,
        });
    }, [props.revurdering.id]);

    if (!props.revurdering) {
        return (
            <div className={styles.advarselContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeRevurdering')}</Alert>
            </div>
        );
    }

    if (!erRevurderingTilAttestering(props.revurdering)) {
        return (
            <div className={styles.advarselContainer}>
                <Alert variant="error">{formatMessage('feil.ikkeTilAttestering')}</Alert>
            </div>
        );
    }

    const handleShowBrevClick = async () => {
        hentPdf({ sakId: props.sakInfo.id, revurderingId: props.revurdering.id }, (data) => {
            window.open(URL.createObjectURL(data));
        });
    };

    const iverksettCallback = () => {
        iverksett({ sakId: props.sakInfo.id, revurderingId: props.revurdering.id }, (iverksatteRevurdering) => {
            dispatch(sakSlice.fetchSak({ saksnummer: props.sakInfo.nummer.toString() }));

            const message =
                iverksatteRevurdering.tilbakekrevingsbehandling === null ||
                !(iverksatteRevurdering.tilbakekrevingsbehandling.avgjørelse === TilbakekrevingsAvgjørelse.TILBAKEKREV)
                    ? formatMessage('attester.iverksatt')
                    : formatMessage('attester.iverksatt.med.tilbakekreving');

            Routes.navigateToSakIntroWithMessage(navigate, message, props.sakInfo.id);
        });
    };

    const underkjennCallback = (grunn: UnderkjennelseGrunn, kommentar: string) => {
        underkjenn({ sakId: props.sakInfo.id, revurderingId: props.revurdering.id, grunn, kommentar }, () => {
            const message = formatMessage('attester.sendtTilbake');
            Routes.navigateToSakIntroWithMessage(navigate, message, props.sakInfo.id);
        });
    };

    const warnings = hentWarnings(props.revurdering);

    return pipe(
        grunnlagsdataOgVilkårsvurderinger,
        RemoteData.fold(
            () => <Loader />,
            () => <Loader />,
            (err) => <ApiErrorAlert error={err} />,
            (gjeldendeData) => (
                <div className={styles.mainContentContainer}>
                    <AttesteringsForm
                        sakId={props.sakInfo.id}
                        iverksett={{ fn: iverksettCallback, status: iverksettStatus }}
                        underkjenn={{ fn: underkjennCallback, status: underkjennStatus }}
                    />
                    <div className={styles.panelerContainer}>
                        <div className={styles.oppsummeringContainer}>
                            <OppsummeringAvInformasjonsrevurdering
                                revurdering={props.revurdering}
                                grunnlagsdataOgVilkårsvurderinger={gjeldendeData.grunnlagsdataOgVilkårsvurderinger}
                            />
                        </div>

                        {warnings.length > 0 &&
                            warnings.map((w) => (
                                <div key={w} className={styles.opphørsadvarsel}>
                                    <Alert variant="warning">{formatMessage(w)}</Alert>
                                </div>
                            ))}
                        <Oppsummeringspanel
                            ikon={Oppsummeringsikon.Email}
                            farge={Oppsummeringsfarge.Limegrønn}
                            tittel={formatMessage('oppsummeringspanel.forhåndsvarselOgVedtaksbrev')}
                        >
                            <div className={styles.brevvalgContainer}>
                                <OppsummeringPar
                                    label={formatMessage('brevvalg.skalSendeBrev')}
                                    verdi={formatMessage(props.revurdering.brevvalg.valg)}
                                    retning={'vertikal'}
                                />
                                {props.revurdering.brevvalg.begrunnelse && (
                                    <div className={styles.begrunnelseContainer}>
                                        <OppsummeringPar
                                            label={formatMessage('brevvalg.begrunnelse')}
                                            verdi={props.revurdering.brevvalg.begrunnelse}
                                            retning={'vertikal'}
                                        />
                                    </div>
                                )}
                                {props.revurdering.brevvalg.valg === Valg.SEND && (
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
                            </div>
                            <Accordion className={styles.accordion}>
                                <Accordion.Item>
                                    <Accordion.Header className={styles.accordionHeader}>
                                        <Heading level="3" size="medium">
                                            {formatMessage('accordion.forhåndsvarsling')}
                                        </Heading>
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        <VisDokumenter id={props.revurdering.id} idType={DokumentIdType.Revurdering} />
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion>
                        </Oppsummeringspanel>

                        {RemoteData.isFailure(hentPdfStatus) && (
                            <Alert variant="error" className={styles.brevFeil}>
                                {formatMessage('feil.klarteIkkeHenteBrev')}
                            </Alert>
                        )}
                    </div>
                </div>
            ),
        ),
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
        warnings.push('info.opphør');
    }
    if (tilbakekreving) {
        warnings.push('tilbakereving.alert.brutto.netto');
    }
    return warnings;
};

export default AttesterRevurdering;
