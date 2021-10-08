import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import { Innholdstittel } from 'nav-frontend-typografi/';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import * as PdfApi from '~api/pdfApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useBrevForhåndsvisning } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppSelector, useAppDispatch } from '~redux/Store';
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

type Props = {
    sak: Sak;
};

interface FormData {
    fritekst: string;
}

const SendTilAttesteringPage = (props: Props) => {
    const { sak } = props;
    const { intl } = useI18n({ messages });

    const dispatch = useAppDispatch();
    const { sendtTilAttesteringStatus } = useAppSelector((s) => s.sak);
    const { sakId, behandlingId } = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = sak.behandlinger.find((x) => x.id === behandlingId);

    const initialValues: FormData = { fritekst: behandling?.fritekstTilBrev ?? '' };
    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        'SendTilAttesteringPage',
        ({ fritekst }) => fritekst === initialValues.fritekst
    );

    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);

    const history = useHistory();

    const vilkårUrl = (vilkårType: Vilkårtype) => {
        return createVilkårUrl({
            sakId: sakId,
            behandlingId: behandlingId,
            vilkar: vilkårType,
        });
    };

    const sisteVurderteVilkår = behandling
        ? mapToVilkårsinformasjon(behandling.behandlingsinformasjon)
              .reverse()
              .find((vilkår) => vilkår.status !== VilkårVurderingStatus.IkkeVurdert)
        : undefined;

    const tilbakeUrl = useMemo(() => {
        if (behandling && erVilkårsvurderingerVurdertAvslag(behandling) && !erBeregnetAvslag(behandling))
            return vilkårUrl(sisteVurderteVilkår?.vilkårtype ?? Vilkårtype.PersonligOppmøte);

        return vilkårUrl(Vilkårtype.Beregning);
    }, [behandling, sisteVurderteVilkår]);

    const handleSubmit = async (values: FormData) => {
        const response = await dispatch(
            sakSlice.sendTilAttestering({
                sakId: sak.id,
                behandlingId: behandlingId,
                fritekstTilBrev: values.fritekst,
            })
        );
        if (sakSlice.sendTilAttestering.fulfilled.match(response)) {
            clearDraft();
            const message = intl.formatMessage({ id: 'vedtak.sendtTilAttestering' });
            history.push(Routes.createSakIntroLocation(message, sak.id));
        }
    };

    const form = useForm({
        defaultValues: draft ?? initialValues,
    });
    useDraftFormSubscribe(form.watch);

    if (!behandling) {
        return <Alert variant="error">{intl.formatMessage({ id: 'feilmelding.fantIkkeBehandlingsId' })}</Alert>;
    }

    if (erSimulert(behandling) || erAvslått(behandling) || erUnderkjent(behandling)) {
        return (
            <form className={styles.vedtakContainer} onSubmit={form.handleSubmit(handleSubmit)}>
                <div>
                    <div className={styles.tittelContainer}>
                        <Innholdstittel className={styles.pageTittel}>
                            {intl.formatMessage({ id: 'page.tittel' })}
                        </Innholdstittel>
                    </div>

                    <Søknadsbehandlingoppsummering sak={sak} behandling={behandling} />
                </div>
                <div className={styles.fritekstareaOuterContainer}>
                    <div className={styles.fritekstareaContainer}>
                        <Controller
                            control={form.control}
                            name="fritekst"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label={intl.formatMessage({ id: 'input.fritekst.label' })}
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                        {RemoteData.isFailure(brevStatus) && (
                            <Alert variant="error">{intl.formatMessage({ id: 'feilmelding.brevhentingFeilet' })}</Alert>
                        )}
                        <Button
                            variant="secondary"
                            className={styles.visBrevKnapp}
                            type="button"
                            onClick={() => {
                                lastNedBrev({
                                    sakId,
                                    behandlingId: behandling.id,
                                    fritekst: form.getValues().fritekst,
                                });
                            }}
                            size="small"
                        >
                            {intl.formatMessage({ id: 'knapp.vis' })}
                            {RemoteData.isPending(brevStatus) && <Loader />}
                        </Button>
                    </div>
                </div>
                <div className={styles.navigeringContainer}>
                    <LinkAsButton variant="secondary" href={tilbakeUrl}>
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </LinkAsButton>
                    <Button type="submit">
                        {intl.formatMessage({ id: 'knapp.sendTilAttestering' })}
                        {RemoteData.isPending(sendtTilAttesteringStatus) && <Loader />}
                    </Button>
                </div>
                {RemoteData.isFailure(sendtTilAttesteringStatus) && (
                    <ApiErrorAlert error={sendtTilAttesteringStatus.error} />
                )}
            </form>
        );
    }

    return <div>{intl.formatMessage({ id: 'behandling.ikkeFerdig' })}</div>;
};

export default SendTilAttesteringPage;
