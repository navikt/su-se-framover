import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';
import { Vilkårtype, VilkårVurderingStatus } from '~types/Vilkårsvurdering';
import {
    erAvslått,
    erUnderkjent,
    erSimulert,
    erBeregnetAvslag,
    erVilkårsvurderingerVurdertAvslag,
} from '~utils/behandling/behandlingUtils';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~utils/søknadsbehandling/vilkår/vilkårUtils';

import messages from './sendTilAttesteringPage-nb';
import styles from './sendTilAttesteringPage.module.less';

interface FormData {
    fritekst: string;
}

const SendTilAttesteringPage = (props: { sak: Sak }) => {
    const { formatMessage } = useI18n({ messages });

    const history = useHistory();
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(sakSlice.sendTilAttestering);
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);
    const { behandlingId } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak.behandlinger.find((x) => x.id === behandlingId);

    const initialValues: FormData = { fritekst: behandling?.fritekstTilBrev ?? '' };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        'SendTilAttesteringPage',
        ({ fritekst }) => fritekst === initialValues.fritekst
    );

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: props.sak.id,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = behandling
        ? mapToVilkårsinformasjon(behandling.behandlingsinformasjon, behandling.grunnlagsdataOgVilkårsvurderinger)
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
                history.push(Routes.createSakIntroLocation(message, props.sak.id));
            }
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
                <Søknadsbehandlingoppsummering sak={props.sak} behandling={behandling} />

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
