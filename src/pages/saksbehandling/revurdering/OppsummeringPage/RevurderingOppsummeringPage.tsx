import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage } from '~src/api/apiClient';
import { BeregnOgSimuler } from '~src/api/revurderingApi';
import * as sakApi from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import apiErrorMessages from '~src/components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import Revurderingoppsummering from '~src/components/revurdering/oppsummering/Revurderingoppsummering';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator, useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { VelgForhåndsvarselForm } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/forhåndsvarsel/ForhåndsvarselForm';
import {
    getOppsummeringsformState,
    hentBrevsending,
    OppsummeringState,
} from '~src/pages/saksbehandling/revurdering/OppsummeringPage/revurderingOppsummeringsPageUtils';
import {
    TilbakekrevingForm,
    Tilbakekrevingsavgjørelse,
} from '~src/pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import {
    BeregnetIngenEndring,
    BeslutningEtterForhåndsvarsling,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~src/types/Revurdering';
import {
    erBeregnetIngenEndring,
    erRevurderingSimulert,
    erRevurderingUnderkjent,
    harBeregninger,
    harSimulering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import { ResultatEtterForhåndsvarselform, SendTilAttesteringForm } from './oppsummeringPageForms/OppsummeringPageForms';
import messages from './revurderingOppsummeringPage-nb';
import * as styles from './revurderingOppsummeringPage.module.less';

const OppsummeringshandlingForm = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: SimulertRevurdering | BeregnetIngenEndring | UnderkjentRevurdering;
    feilmeldinger: ErrorMessage[];
    varselmeldinger: ErrorMessage[];
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...apiErrorMessages } });
    const feilRef = React.useRef<HTMLDivElement>(null);

    const [sendTilAttesteringState, sendTilAttestering] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.sendRevurderingTilAttestering,
        (args: { vedtaksbrevtekst: string; skalFøreTilBrevutsending: boolean }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fritekstTilBrev: args.vedtaksbrevtekst,
                skalFøreTilBrevutsending: args.skalFøreTilBrevutsending,
            };
        },
        () => {
            Routes.navigateToSakIntroWithMessage(
                navigate,
                formatMessage('notification.sendtTilAttestering'),
                props.sakId
            );
        }
    );

    const [fortsettEtterForhåndsvarselState, fortsettEtterForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.fortsettEtterForhåndsvarsel,
        (args: {
            beslutningEtterForhåndsvarsel: BeslutningEtterForhåndsvarsling;
            brevtekst: string;
            begrunnelse: string;
        }) => {
            if (props.feilmeldinger.length > 0) {
                feilRef.current?.focus();
                return;
            }
            return {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: args.begrunnelse,
                valg: args.beslutningEtterForhåndsvarsel,
                fritekstTilBrev: args.brevtekst,
            };
        },
        (args) => {
            switch (args.beslutningEtterForhåndsvarsel) {
                case BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger:
                    navigate(props.førsteRevurderingstegUrl);
                    break;
                case BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger:
                    Routes.navigateToSakIntroWithMessage(
                        navigate,
                        formatMessage('notification.sendtTilAttestering'),
                        props.sakId
                    );
                    break;
                case BeslutningEtterForhåndsvarsling.AvsluttUtenEndringer:
                    Routes.navigateToSakIntroWithMessage(
                        navigate,
                        formatMessage('notification.avsluttetRevurdering'),
                        props.sakId
                    );
            }
        }
    );

    const oppsummeringsformState = getOppsummeringsformState(props.revurdering);

    return (
        <div>
            {props.varselmeldinger.length > 0 && (
                <Alert variant="info" className={styles.alertstripe}>
                    <ul>
                        {props.varselmeldinger.map((m) => (
                            <li key={m.code}>{formatMessage(m.code ?? ApiErrorCode.UKJENT_FEIL)}</li>
                        ))}
                    </ul>
                </Alert>
            )}
            {props.feilmeldinger.length > 0 && (
                <div ref={feilRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className={styles.alertstripe}>
                    <UtfallSomIkkeStøttes feilmeldinger={props.feilmeldinger} />
                </div>
            )}
            {oppsummeringsformState === OppsummeringState.ATTESTERING && (
                <SendTilAttesteringForm
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
                    brevsending={hentBrevsending(props.revurdering)}
                    submitStatus={sendTilAttesteringState}
                    onSubmit={sendTilAttestering}
                />
            )}
            {oppsummeringsformState === OppsummeringState.TILBAKEKREVING && (
                <TilbakekrevingForm
                    revurdering={props.revurdering}
                    forrige={{ url: props.forrigeUrl, visModal: false }}
                    sakId={props.sakId}
                />
            )}
            {oppsummeringsformState === OppsummeringState.FORHÅNDSVARSLING && (
                <VelgForhåndsvarselForm
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    tilbake={{ url: props.forrigeUrl, visModal: false }}
                />
            )}
            {oppsummeringsformState === OppsummeringState.ER_FORHÅNDSVARSLET && (
                <ResultatEtterForhåndsvarselform
                    sakId={props.sakId}
                    revurdering={props.revurdering}
                    forrigeUrl={props.forrigeUrl}
                    submitStatus={fortsettEtterForhåndsvarselState}
                    onSubmit={fortsettEtterForhåndsvarsel}
                />
            )}
        </div>
    );
};

const RevurderingOppsummeringPage = (props: {
    sakId: string;
    forrigeUrl: string;
    førsteRevurderingstegUrl: string;
    revurdering: InformasjonsRevurdering;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [beregnOgSimulerStatus, beregnOgSimuler] = useAsyncActionCreator(RevurderingActions.beregnOgSimuler);
    const [gjeldendeData, hentGjeldendeData] = useApiCall(sakApi.hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);

    const beregningStatus = harBeregninger(props.revurdering)
        ? RemoteData.success<never, BeregnOgSimuler>({
              revurdering: props.revurdering as SimulertRevurdering,
              feilmeldinger: [],
              varselmeldinger: [],
          })
        : beregnOgSimulerStatus;

    React.useEffect(() => {
        if (RemoteData.isInitial(beregningStatus)) {
            beregnOgSimuler({
                sakId: props.sakId,
                periode: props.revurdering.periode,
                revurderingId: props.revurdering.id,
            });
        }

        if (RemoteData.isInitial(gjeldendeData)) {
            hentGjeldendeData({
                sakId: props.sakId,
                fraOgMed: props.revurdering.periode.fraOgMed,
            });
        }
    }, [props.revurdering.id]);

    return pipe(
        RemoteData.combine(beregningStatus, gjeldendeData),
        RemoteData.fold(
            () => <SpinnerMedTekst className={styles.henterInnholdContainer} />,
            () => <SpinnerMedTekst className={styles.henterInnholdContainer} />,
            (err) => (
                <div className={styles.content}>
                    <ApiErrorAlert error={err} />
                    <Button variant="secondary" onClick={() => navigate(props.forrigeUrl)}>
                        {formatMessage('knapp.tilbake')}
                    </Button>
                </div>
            ),
            ([beregning, data]) => (
                <div className={styles.content}>
                    <Revurderingoppsummering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={data.grunnlagsdataOgVilkårsvurderinger}
                    />
                    {harSimulering(props.revurdering) &&
                        periodenInneholderTilbakekrevingOgAndreTyper(
                            props.revurdering.simulering,
                            props.revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT
                        ) && <Alert variant={'warning'}>{formatMessage('tilbakekreving.alert')}</Alert>}
                    {props.revurdering.tilbakekrevingsbehandling !== null &&
                        props.revurdering.tilbakekrevingsbehandling.avgjørelse ===
                            Tilbakekrevingsavgjørelse.TILBAKEKREV && (
                            <Alert variant={'warning'}>{formatMessage('tilbakereving.alert.brutto.netto')}</Alert>
                        )}
                    {erRevurderingSimulert(props.revurdering) ||
                    erBeregnetIngenEndring(props.revurdering) ||
                    erRevurderingUnderkjent(props.revurdering) ? (
                        <OppsummeringshandlingForm
                            sakId={props.sakId}
                            forrigeUrl={props.forrigeUrl}
                            førsteRevurderingstegUrl={props.førsteRevurderingstegUrl}
                            revurdering={props.revurdering}
                            feilmeldinger={beregning.feilmeldinger}
                            varselmeldinger={beregning.varselmeldinger}
                        />
                    ) : (
                        <div>{formatMessage('feil.revurderingIUgyldigTilstand')}</div>
                    )}
                </div>
            )
        )
    );
};

export default RevurderingOppsummeringPage;
