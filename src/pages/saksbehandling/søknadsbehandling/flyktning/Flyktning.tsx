import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup } from '@navikt/ds-react';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { FlyktningFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erUnderkjent, erVilkårsvurderingerVurdertAvslag } from '~src/utils/behandling/behandlingUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../vurderingknapper/Vurderingknapper';

import messages from './flyktning-nb';
import * as styles from './flyktning.module.less';

interface FormData {
    status: Nullable<Vilkårstatus>;
}

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt, Vilkårstatus.Uavklart],
                'Du må velge om vilkåret er oppfylt'
            ),
    })
    .required();

const Flyktning = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const navigate = useNavigate();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);

    const initialValues: FormData = { status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Flyktning,
        (values) => values.status === initialValues.status
    );

    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandling.id,
    });

    const saksoversiktUrl = Routes.saksoversiktValgtSak.createURL({
        sakId: props.sakId,
    });

    const save = (values: FormData, ingenEndringPath: string, onSuccess: (behandling: Behandling) => void) => {
        if (values.status === initialValues.status) {
            clearDraft();
            navigate(ingenEndringPath);
            return;
        }

        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: {
                        status: values.status!,
                    },
                },
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling);
            }
        );
    };

    const handleSubmit = (values: FormData) =>
        save(
            values,
            erVilkårsvurderingerVurdertAvslag(props.behandling) || erUnderkjent(props.behandling)
                ? vedtakUrl
                : props.nesteUrl,
            (behandling) =>
                navigate(behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG ? vedtakUrl : props.nesteUrl)
        );

    const {
        formState: { errors, isSubmitted, isValid },
        ...form
    } = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const watchStatus = form.watch('status');

    const vilGiTidligAvslag = useMemo(
        () =>
            props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
            watchStatus === Vilkårstatus.VilkårIkkeOppfylt,
        [watchStatus, props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre]
    );

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit, focusAfterTimeout(feiloppsummeringRef))}>
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    legend={formatMessage('radio.flyktning.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    onChange={field.onChange}
                                    value={field.value ?? ''}
                                >
                                    <Radio
                                        id={field.name}
                                        name={field.name}
                                        value={Vilkårstatus.VilkårOppfylt}
                                        ref={field.ref}
                                    >
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio
                                        name={field.name}
                                        onChange={() => field.onChange(Vilkårstatus.VilkårIkkeOppfylt)}
                                        value={Vilkårstatus.VilkårIkkeOppfylt}
                                    >
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio
                                        name={field.name}
                                        onChange={() => field.onChange(Vilkårstatus.Uavklart)}
                                        value={Vilkårstatus.Uavklart}
                                    >
                                        {formatMessage('radio.label.uavklart')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />

                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        {vilGiTidligAvslag && (
                            <Alert className={styles.avslagAdvarsel} variant="info">
                                {formatMessage('display.avslag.advarsel')}
                            </Alert>
                        )}

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => navigate(props.forrigeUrl)}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                (values) => save(values, saksoversiktUrl, () => navigate(saksoversiktUrl)),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            nesteKnappTekst={vilGiTidligAvslag ? formatMessage('knapp.tilVedtaket') : undefined}
                            loading={RemoteData.isPending(status)}
                        />
                    </form>
                ),
                right: <FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Flyktning;
