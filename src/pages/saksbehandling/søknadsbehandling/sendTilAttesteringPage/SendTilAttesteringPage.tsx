import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import OppsummeringAvSøknadsbehandling from '~src/components/oppsummering/søknadsbehandlingoppsummering/OppsummeringAvSøknadsbehandling';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
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

import messages from './sendTilAttesteringPage-nb';
import styles from './sendTilAttesteringPage.module.less';

interface FormData {
    fritekst: string;
}

const SendTilAttesteringPage = () => {
    const props = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });

    const navigate = useNavigate();
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(
        SøknadsbehandlingActions.sendTilAttestering,
    );
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);
    const { behandlingId = '' } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak.behandlinger.find((x) => x.id === behandlingId);

    const initialValues: FormData = { fritekst: behandling?.fritekstTilBrev ?? '' };
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

    const handleSubmit = async (values: FormData) => {
        sendTilAttestering(
            {
                sakId: props.sak.id,
                behandlingId: behandlingId,
                fritekstTilBrev: values.fritekst,
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

    if (!behandling) {
        return <Alert variant="error">{formatMessage('feilmelding.fantIkkeBehandlingsId')}</Alert>;
    }

    if (erSimulert(behandling) || erAvslått(behandling) || erUnderkjent(behandling)) {
        return (
            <form className={styles.vedtakContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                <OppsummeringAvSøknadsbehandling behandling={behandling} />
                <div className={styles.fritekstareaOuterContainer}>
                    <div className={styles.fritekstareaContainer}>
                        <Controller
                            control={form.control}
                            name="fritekst"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label={formatMessage('input.fritekst.label')}
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
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
                                    fritekst: form.getValues().fritekst,
                                });
                            }}
                            size="small"
                        >
                            {formatMessage('knapp.vis')}
                            {RemoteData.isPending(brevStatus) && <Loader />}
                        </Button>
                    </div>
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
