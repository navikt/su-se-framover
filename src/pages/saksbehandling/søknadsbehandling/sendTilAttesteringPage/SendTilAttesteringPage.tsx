import * as RemoteData from '@devexperts/remote-data-ts';
import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Alert, Button, Loader, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import { hentMottaker } from '~src/api/mottakerClient.ts';
import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils';
import OppsummeringAvSøknadsbehandling from '~src/components/oppsummering/søknadsbehandlingoppsummering/OppsummeringAvSøknadsbehandling';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { ApiResult, useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { MottakerForm } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types.ts';
import { Sakstype } from '~src/types/Sak';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse, Valg } from '~src/types/Søknadsbehandling.ts';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import {
    erAvslått,
    erBeregnetAvslag,
    erSimulert,
    erUnderkjent,
    erVilkårsvurderingerVurdertAvslag,
} from '~src/utils/SøknadsbehandlingUtils';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~src/utils/vilkårUtils';
import styles from './sendTilAttesteringPage.module.less';
import messages from './sendTilAttesteringPage-nb';

interface FormData {
    valg: Valg;
    fritekst: string;
}
type Props = VilkårsvurderingBaseProps & {
    tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
};
const SendTilAttesteringPage = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();

    const [lagreBrevStatus, lagreAction] = useAsyncActionCreator(SøknadsbehandlingActions.lagreBrevvalg);

    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);
    const [skalLeggeTilMottaker, setSkalLeggeTilMottaker] = useState(false);
    const [mottakerFinnes, setMottakerFinnes] = useState<boolean | null>(null);
    const [mottakerFetchError, setMottakerFetchError] = useState<MottakerAlert | null>(null);

    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(
        SøknadsbehandlingActions.sendTilAttestering,
    );

    const lagreBrev = (values: FormData, onSuccess: () => void) => {
        lagreAction(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                valg: values.valg,
                fritekst: values.valg === Valg.IKKE_SEND ? null : values.fritekst,
            },
            onSuccess,
        );
    };

    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandling);

    const initialValues: FormData = { valg: Valg.SEND, fritekst: '' };
    const { draft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        'SendTilAttesteringPage',
        ({ fritekst }) => fritekst === initialValues.fritekst,
    );

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = mapToVilkårsinformasjon(
        Sakstype.Uføre,
        props.behandling.grunnlagsdataOgVilkårsvurderinger,
    )
        .reverse()
        .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert);

    const tilbakeUrl = useMemo(() => {
        if (erVilkårsvurderingerVurdertAvslag(props.behandling) && !erBeregnetAvslag(props.behandling))
            return vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte);

        return vilkårUrl(Vilkårtype.Beregning);
    }, [props.behandling, sisteVurderteVilkår]);

    const handleSubmit = async (values: FormData) => {
        lagreBrev(values, () => {
            sendTilAttestering(
                {
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                },
                () => {
                    const message = formatMessage('vedtak.sendtTilAttestering');
                    Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
                },
            );
        });
    };

    const form = useForm({
        defaultValues: draft ?? initialValues,
    });
    useDraftFormSubscribe(form.watch);

    const valg = form.watch('valg');

    useEffect(() => {
        hentFritekst({
            referanseId: props.behandling.id,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                form.setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [props.behandling.id, props.sakId, form]);

    useEffect(() => {
        const sjekkMottaker = async () => {
            setMottakerFinnes(null);
            setMottakerFetchError(null);

            const setMottakerFunnet = () => {
                setMottakerFinnes(true);
                setSkalLeggeTilMottaker(true);
                setMottakerFetchError(null);
            };

            const setMottakerIkkeFunnet = () => {
                setMottakerFinnes(false);
                setSkalLeggeTilMottaker(false);
                setMottakerFetchError(null);
            };

            const res = await hentMottaker(props.sakId, 'SØKNAD', props.behandling.id, 'VEDTAK');

            if (res.status === 'ok') {
                if (res.data) {
                    setMottakerFunnet();
                } else {
                    setMottakerIkkeFunnet();
                }
                return;
            }

            if (res.error.statusCode === 404) {
                setMottakerIkkeFunnet();
                return;
            }

            setMottakerFinnes(false);
            setSkalLeggeTilMottaker(false);
            setMottakerFetchError(toMottakerAlert(res.error, formatMessage('feilmelding.kanIkkeHenteMottaker')));
        };

        sjekkMottaker();
    }, [props.behandling.id, props.sakId]);

    if (erSimulert(props.behandling) || erAvslått(props.behandling) || erUnderkjent(props.behandling)) {
        return (
            <ToKolonner tittel={'Vedtaksbrev'} width="40/60">
                {{
                    left: (
                        <form className={styles.vedtakContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                            <div>
                                <Controller
                                    control={form.control}
                                    name="valg"
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            {...field}
                                            legend={
                                                <span className={styles.legendWithInfo}>
                                                    {formatMessage('brevvalg.skal.det.sendes.brev')}
                                                    <span className={styles.infoIconWrapper}>
                                                        <InformationSquareIcon />
                                                        <span className={styles.infoText}>
                                                            {formatMessage('vedtak.hjelpetekst')}
                                                        </span>
                                                    </span>
                                                </span>
                                            }
                                            error={fieldState.error?.message}
                                            value={field.value ?? Valg.SEND}
                                        >
                                            <Radio value={Valg.SEND}>{formatMessage('ja')}</Radio>
                                            <Radio value={Valg.IKKE_SEND}>{formatMessage('nei')}</Radio>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                            <div className={styles.fritekstareaOuterContainer}>
                                <div className={styles.fritekstareaContainer}>
                                    {valg === Valg.SEND && (
                                        <TextareaWithAutosave
                                            textarea={{
                                                name: 'fritekst',
                                                label: formatMessage('input.fritekst.label'),
                                                control: form.control,
                                                value: form.watch('fritekst') ?? '',
                                                description: [formatMessage('knapp.brev.fritekst.description')],
                                            }}
                                            save={{
                                                handleSave: () => {
                                                    lagreFritekst({
                                                        referanseId: props.behandling.id,
                                                        sakId: props.sakId,
                                                        type: FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING,
                                                        fritekst: form.watch('fritekst') ?? '',
                                                    });
                                                },
                                                status: lagreFritekstStatus,
                                            }}
                                        />
                                    )}
                                </div>
                                {valg === Valg.SEND && (
                                    <div className={styles.visBrevContainer}>
                                        {RemoteData.isFailure(brevStatus) && (
                                            <Alert variant="error">
                                                {formatMessage('feilmelding.brevhentingFeilet')}
                                            </Alert>
                                        )}
                                        <Button
                                            variant="secondary"
                                            className={styles.visBrevKnapp}
                                            type="button"
                                            onClick={() => {
                                                lastNedBrev({
                                                    sakId: props.sakId,
                                                    behandlingId: props.behandling.id,
                                                    underAttestering: false,
                                                });
                                            }}
                                            size="small"
                                        >
                                            {formatMessage('knapp.vis')}
                                            {RemoteData.isPending(brevStatus) && <Loader />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {valg === Valg.SEND && (
                                <div>
                                    {mottakerFetchError && (
                                        <Alert variant={mottakerFetchError.variant} size="small">
                                            {mottakerFetchError.text}
                                        </Alert>
                                    )}
                                    <Button
                                        variant="secondary"
                                        className={styles.visBrevKnapp}
                                        type="button"
                                        onClick={() => setSkalLeggeTilMottaker((prev) => !prev)}
                                        size="small"
                                        disabled={mottakerFinnes === null}
                                    >
                                        {skalLeggeTilMottaker
                                            ? formatMessage('knapp.lukkmottaker')
                                            : mottakerFinnes
                                              ? formatMessage('knapp.vismottaker')
                                              : formatMessage('knapp.leggtilmottaker')}
                                    </Button>
                                    {skalLeggeTilMottaker && (
                                        <MottakerForm
                                            sakId={props.sakId}
                                            referanseId={props.behandling.id}
                                            referanseType={'SØKNAD'}
                                            brevtype={'VEDTAK'}
                                            onClose={() => setSkalLeggeTilMottaker(false)}
                                        />
                                    )}
                                </div>
                            )}
                            <div className={styles.navigeringContainer}>
                                <LinkAsButton variant="secondary" href={tilbakeUrl}>
                                    {formatMessage('knapp.tilbake')}
                                </LinkAsButton>
                                <Button type="submit">
                                    {formatMessage('knapp.sendTilAttestering')}
                                    {RemoteData.isPending(sendTilAttesteringStatus) && <Loader />}
                                </Button>
                            </div>

                            {RemoteData.isFailure(lagreBrevStatus) && <ApiErrorAlert error={lagreBrevStatus.error} />}
                            {RemoteData.isFailure(sendTilAttesteringStatus) && (
                                <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                            )}
                        </form>
                    ),
                    right: <OppsummeringAvSøknadsbehandling behandling={props.behandling} />,
                }}
            </ToKolonner>
        );
    }

    return <div>{formatMessage('behandling.ikkeFerdig')}</div>;
};

export default SendTilAttesteringPage;
