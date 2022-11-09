import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ErrorMessage } from '~src/api/apiClient';
import { hentgjeldendeGrunnlagsdataOgVilkårsvurderinger } from '~src/api/GrunnlagOgVilkårApi';
import * as pdfApi from '~src/api/pdfApi';
import { BeregnOgSimuler } from '~src/api/revurderingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import apiErrorMessages from '~src/components/apiErrorAlert/ApiErrorAlert-nb';
import { ApiErrorCode } from '~src/components/apiErrorAlert/apiErrorCode';
import { BrevInput } from '~src/components/brevInput/BrevInput';
import SpinnerMedTekst from '~src/components/henterInnhold/SpinnerMedTekst';
import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator, useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import {
    getOppsummeringsformState,
    hentBrevsending,
    OppsummeringState,
} from '~src/pages/saksbehandling/revurdering/OppsummeringPage/revurderingOppsummeringsPageUtils';
import { TilbakekrevingForm } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/tilbakekreving/TilbakekrevingForm';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import {
    BeregnetIngenEndring,
    InformasjonsRevurdering,
    InformasjonsRevurderingStatus,
    SimulertRevurdering,
    UnderkjentRevurdering,
} from '~src/types/Revurdering';
import {
    erBeregnetIngenEndring,
    erRevurderingSimulert,
    erRevurderingTilbakekreving,
    erRevurderingUnderkjent,
    harBeregninger,
    harSimulering,
    periodenInneholderTilbakekrevingOgAndreTyper,
} from '~src/utils/revurdering/revurderingUtils';

import { VisDokumenter } from '../../dokumenter/DokumenterPage';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import { SendTilAttesteringForm } from './oppsummeringPageForms/OppsummeringPageForms';
import messages from './revurderingOppsummeringPage-nb';
import * as styles from './revurderingOppsummeringPage.module.less';

const OppsummeringshandlingForm = (props: {
    sakId: string;
    forrigeUrl: string;
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
            <VisOgLagDokumenterRevurdering revurderingId={props.revurdering.id} sakId={props.sakId} />
            {oppsummeringsformState === OppsummeringState.ATTESTERING && (
                <SendTilAttesteringForm
                    sakid={props.sakId}
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
        </div>
    );
};

export type NyttDokumentRevurderingFormData = {
    lagNy: boolean;
    fritekst: Nullable<string>;
};

const VisOgLagDokumenterRevurdering = (props: { sakId: string; revurderingId: string }) => {
    const { formatMessage } = useI18n({ messages: { ...messages } }); //TODO legg til tekster

    const navigate = useNavigate();

    const form = useForm<NyttDokumentRevurderingFormData>({
        defaultValues: {
            lagNy: false, //TODO default tekster opphør + tilbakekreving kanskje bare la saksbehandler velge fra dropdown ellerno for å redusere knytning mot revurdering?
        }, //TODO noe validering?
    });

    const [lagreForhåndsvarselState, lagreForhåndsvarsel] = useAsyncActionCreatorWithArgsTransformer(
        RevurderingActions.lagreForhåndsvarsel,
        (args: { fritekst: string }) => ({
            sakId: props.sakId,
            revurderingId: props.revurderingId,
            fritekstTilBrev: args.fritekst,
        }),
        () => {
            Routes.navigateToSakIntroWithMessage(navigate, 'sendt forhåndsvarsel', props.sakId);
            return;
        }
    );

    formatMessage('beregner.label'); //fjern

    const skalLageNy = form.watch('lagNy');
    const isLoading = RemoteData.isPending(lagreForhåndsvarselState);

    //TODO styling
    return (
        <>
            <div>
                <VisDokumenter id={props.revurderingId} idType={DokumentIdType.Revurdering} />
                <Button
                    variant="secondary"
                    onClick={() => {
                        form.setValue('lagNy', !form.getValues('lagNy'));
                    }}
                    type="button"
                >
                    {skalLageNy ? 'angre' : 'lag nytt forhåndsvarsel'}
                </Button>
                {skalLageNy && (
                    <Controller
                        control={form.control}
                        name="fritekst"
                        render={({ field, fieldState }) => (
                            <BrevInput
                                knappLabel={'forhåndsvis'}
                                placeholder={'placeholder'}
                                tittel={'tittel'}
                                onVisBrevClick={() =>
                                    pdfApi.fetchBrevutkastForForhåndsvarsel(
                                        props.sakId,
                                        props.revurderingId,
                                        field.value ?? ''
                                    )
                                }
                                tekst={field.value ?? ''}
                                onChange={field.onChange}
                                feil={fieldState.error}
                            />
                        )}
                    />
                )}
                {
                    skalLageNy && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                form.setValue('lagNy', !form.getValues('lagNy'));
                                lagreForhåndsvarsel({ fritekst: form.getValues('fritekst') ?? '' });
                            }}
                            type="button"
                            loading={isLoading}
                        >
                            {'send forhåndsvarsel og avslutt til saksoversikt'}
                        </Button>
                    ) //TODO tilby knapp for bare lagring + refresh av dokumentoversikt?
                }
            </div>
        </>
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
    const [gjeldendeData, hentGjeldendeData] = useApiCall(hentgjeldendeGrunnlagsdataOgVilkårsvurderinger);

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
                tilOgMed: props.revurdering.periode.tilOgMed,
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
                    <OppsummeringAvInformasjonsrevurdering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={data.grunnlagsdataOgVilkårsvurderinger}
                    />
                    {RemoteData.isSuccess(beregnOgSimulerStatus) &&
                        beregnOgSimulerStatus.value.varselmeldinger.length > 0 && (
                            <UtfallSomIkkeStøttes
                                feilmeldinger={beregnOgSimulerStatus.value.varselmeldinger}
                                infoMelding
                            />
                        )}
                    {harSimulering(props.revurdering) &&
                        periodenInneholderTilbakekrevingOgAndreTyper(
                            props.revurdering.simulering,
                            props.revurdering.status === InformasjonsRevurderingStatus.SIMULERT_OPPHØRT
                        ) && <Alert variant={'warning'}>{formatMessage('tilbakekreving.alert')}</Alert>}
                    {erRevurderingTilbakekreving(props.revurdering) && (
                        <Alert variant={'warning'}>{formatMessage('tilbakereving.alert.brutto.netto')}</Alert>
                    )}
                    {erRevurderingSimulert(props.revurdering) ||
                    erBeregnetIngenEndring(props.revurdering) ||
                    erRevurderingUnderkjent(props.revurdering) ? (
                        <OppsummeringshandlingForm
                            sakId={props.sakId}
                            forrigeUrl={props.forrigeUrl}
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
