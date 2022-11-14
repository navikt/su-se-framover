import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Accordion, Alert, Button, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
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
import yup from '~src/lib/validering';
import {
    getOppsummeringsformState,
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

            {oppsummeringsformState === OppsummeringState.ATTESTERING && (
                <div className={styles.forhåndsvarselOgAttesteringContainer}>
                    <Accordion className={styles.accordion}>
                        <Accordion.Item>
                            <Accordion.Header className={styles.accordionHeader}>
                                <Heading level="3" size="medium">
                                    {formatMessage('accordion.forhåndsvarsling')}
                                </Heading>
                            </Accordion.Header>
                            <Accordion.Content>
                                <VisOgLagDokumenterRevurdering
                                    revurderingId={props.revurdering.id}
                                    sakId={props.sakId}
                                />
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion>

                    <SendTilAttesteringForm
                        sakid={props.sakId}
                        revurdering={props.revurdering}
                        forrigeUrl={props.forrigeUrl}
                        submitStatus={sendTilAttesteringState}
                        onSubmit={sendTilAttestering}
                    />
                </div>
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

interface NyttDokumentRevurderingFormData {
    fritekst: Nullable<string>;
}

const nyttDokumentSchema = yup.object<NyttDokumentRevurderingFormData>({
    fritekst: yup.string().nullable().required(),
});

const VisOgLagDokumenterRevurdering = (props: { sakId: string; revurderingId: string }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages } });
    const [vilOppretteNyForhåndsvarsel, setVilOppretteNyForhåndsvarsel] = useState<boolean>(false);

    const form = useForm<NyttDokumentRevurderingFormData>({
        defaultValues: { fritekst: null },
        resolver: yupResolver(nyttDokumentSchema),
    });

    const [lagreForhåndsvarselState, lagreForhåndsvarsel] = useAsyncActionCreator(
        RevurderingActions.lagreForhåndsvarsel
    );

    const handleSubmit = (values: NyttDokumentRevurderingFormData) => {
        lagreForhåndsvarsel(
            {
                sakId: props.sakId,
                revurderingId: props.revurderingId,
                fritekstTilBrev: values.fritekst!,
            },
            () => Routes.navigateToSakIntroWithMessage(navigate, formatMessage('forhåndsvarsel.sendt'), props.sakId)
        );
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className={styles.visDokumenterContainer}>
                <Heading level="5" size={'small'}>
                    {formatMessage('forhåndsvarsel.sendte')}
                </Heading>
                <VisDokumenter id={props.revurderingId} idType={DokumentIdType.Revurdering} />
            </div>
            {!vilOppretteNyForhåndsvarsel && (
                <Button variant="secondary" onClick={() => setVilOppretteNyForhåndsvarsel(true)} type="button">
                    {formatMessage('forhåndsvarsel.ny')}
                </Button>
            )}
            {vilOppretteNyForhåndsvarsel && (
                <>
                    <Controller
                        control={form.control}
                        name="fritekst"
                        render={({ field, fieldState }) => (
                            <BrevInput
                                tittel={formatMessage('forhåndsvarsel.fritekst.input')}
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
                    <div className={styles.forhåndsvarselKnapperContainer}>
                        <Button variant="secondary" onClick={() => setVilOppretteNyForhåndsvarsel(false)} type="button">
                            {formatMessage('forhåndsvarsel.angre')}
                        </Button>
                        <Button loading={RemoteData.isPending(lagreForhåndsvarselState)}>
                            {formatMessage('forhåndsvarsel.sendOgAvslutt')}
                        </Button>
                    </div>
                    {RemoteData.isFailure(lagreForhåndsvarselState) && (
                        <ApiErrorAlert error={lagreForhåndsvarselState.error} />
                    )}
                </>
            )}
        </form>
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
                <div className={styles.contentWrapper}>
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
                </div>
            )
        )
    );
};

export default RevurderingOppsummeringPage;
