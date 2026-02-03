import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader } from '@navikt/ds-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import { hentMottaker } from '~src/api/mottakerClient.ts';
import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvSøknadsbehandling from '~src/components/oppsummering/søknadsbehandlingoppsummering/OppsummeringAvSøknadsbehandling';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { MottakerForm } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { Sakstype } from '~src/types/Sak';
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
    fritekst: string;
}

const SendTilAttesteringPage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });
    const navigate = useNavigate();

    const { behandlingId = '' } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak.behandlinger.find((x) => x.id === behandlingId);

    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);
    const [skalLeggeTilMottaker, setSkalLeggeTilMottaker] = useState(false);
    const [mottakerFinnes, setMottakerFinnes] = useState<boolean | null>(null);

    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(
        SøknadsbehandlingActions.sendTilAttestering,
    );
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandling);

    const initialValues: FormData = { fritekst: '' };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        'SendTilAttesteringPage',
        ({ fritekst }) => fritekst === initialValues.fritekst,
    );

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: props.sak.id,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = behandling
        ? mapToVilkårsinformasjon(Sakstype.Uføre, behandling.grunnlagsdataOgVilkårsvurderinger)
              .reverse()
              .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert)
        : undefined;

    const tilbakeUrl = useMemo(() => {
        if (behandling && erVilkårsvurderingerVurdertAvslag(behandling) && !erBeregnetAvslag(behandling))
            return vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte);

        return vilkårUrl(Vilkårtype.Beregning);
    }, [behandling, sisteVurderteVilkår]);

    const handleSubmit = async () => {
        sendTilAttestering(
            {
                sakId: props.sak.id,
                behandlingId: behandlingId,
            },
            () => {
                clearDraft();
                const message = formatMessage('vedtak.sendtTilAttestering');
                Routes.navigateToSakIntroWithMessage(navigate, message, props.sak.id);
            },
        );
    };

    const form = useForm({
        defaultValues: draft ?? initialValues,
    });
    useDraftFormSubscribe(form.watch);

    useEffect(() => {
        if (!behandlingId) {
            return;
        }
        hentFritekst({
            referanseId: behandlingId,
            sakId: props.sak.id,
            type: FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                form.setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [behandlingId, props.sak.id, form]);

    useEffect(() => {
        if (!behandling) {
            return;
        }

        let aktiv = true;

        const sjekkMottaker = async () => {
            setMottakerFinnes(null);
            const res = await hentMottaker(props.sak.id, 'SØKNAD', behandling.id);

            if (!aktiv) return;

            if (res.status === 'ok' && res.data) {
                setMottakerFinnes(true);
                setSkalLeggeTilMottaker(true);
            } else if (res.status === 'error' && res.error.statusCode === 404) {
                setMottakerFinnes(false);
                setSkalLeggeTilMottaker(false);
            } else {
                setMottakerFinnes(false);
                setSkalLeggeTilMottaker(false);
            }
        };

        sjekkMottaker();

        return () => {
            aktiv = false;
        };
    }, [behandling, props.sak.id]);

    if (!behandling) {
        return <Alert variant="error">{formatMessage('feilmelding.fantIkkeBehandlingsId')}</Alert>;
    }

    if (erSimulert(behandling) || erAvslått(behandling) || erUnderkjent(behandling)) {
        return (
            <form className={styles.vedtakContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                <OppsummeringAvSøknadsbehandling behandling={behandling} />
                <div className={styles.fritekstareaOuterContainer}>
                    <div className={styles.fritekstareaContainer}>
                        <TextareaWithAutosave
                            textarea={{
                                name: 'fritekst',
                                label: formatMessage('input.fritekst.label'),
                                control: form.control,
                                value: form.watch('fritekst') ?? '',
                            }}
                            save={{
                                handleSave: () => {
                                    lagreFritekst({
                                        referanseId: behandlingId,
                                        sakId: props.sak.id,
                                        type: FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING,
                                        fritekst: form.watch('fritekst') ?? '',
                                    });
                                },
                                status: lagreFritekstStatus,
                            }}
                        />
                    </div>
                    <div className={styles.visBrevContainer}>
                        {RemoteData.isFailure(brevStatus) && (
                            <Alert variant="error">{formatMessage('feilmelding.brevhentingFeilet')}</Alert>
                        )}
                        <Button
                            variant="secondary"
                            className={styles.visBrevKnapp}
                            type="button"
                            onClick={() => {
                                lastNedBrev({
                                    sakId: props.sak.id,
                                    behandlingId: behandling.id,
                                    underAttestering: false,
                                });
                            }}
                            size="small"
                        >
                            {formatMessage('knapp.vis')}
                            {RemoteData.isPending(brevStatus) && <Loader />}
                        </Button>
                    </div>
                </div>
                <div>
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
                            sakId={props.sak.id}
                            referanseId={behandling.id}
                            referanseType={'SØKNAD'}
                            onClose={() => setSkalLeggeTilMottaker(false)}
                        />
                    )}
                </div>
                <div className={styles.navigeringContainer}>
                    <LinkAsButton variant="secondary" href={tilbakeUrl}>
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button type="submit">
                        {formatMessage('knapp.sendTilAttestering')}
                        {RemoteData.isPending(sendTilAttesteringStatus) && <Loader />}
                    </Button>
                </div>

                {RemoteData.isFailure(sendTilAttesteringStatus) && (
                    <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                )}
            </form>
        );
    }

    return <div>{formatMessage('behandling.ikkeFerdig')}</div>;
};

export default SendTilAttesteringPage;
