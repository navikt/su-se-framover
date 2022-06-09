import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router-dom';

import * as PdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import Søknadsbehandlingoppsummering from '~src/components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Søknadstema } from '~src/types/Søknad';
import { Vilkårtype, VilkårVurderingStatus } from '~src/types/Vilkårsvurdering';
import {
    erAvslått,
    erBeregnetAvslag,
    erSimulert,
    erUnderkjent,
    erVilkårsvurderingerVurdertAvslag,
} from '~src/utils/behandling/behandlingUtils';
import { AttesteringContext } from '~src/utils/router/routerUtils';
import { createVilkårUrl, mapToVilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import messages from './sendTilAttesteringPage-nb';
import * as styles from './sendTilAttesteringPage.module.less';

interface FormData {
    fritekst: string;
}

const SendTilAttesteringPage = () => {
    const props = useOutletContext<AttesteringContext>();
    const { formatMessage } = useI18n({ messages });

    const navigate = useNavigate();
    const [sendTilAttesteringStatus, sendTilAttestering] = useAsyncActionCreator(sakSlice.sendTilAttestering);
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);
    const { behandlingId = '' } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
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
        ? mapToVilkårsinformasjon(
              Søknadstema.Uføre,
              behandling.behandlingsinformasjon,
              behandling.grunnlagsdataOgVilkårsvurderinger
          )
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
                navigate(Routes.createSakIntroLocation(message, props.sak.id));
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
