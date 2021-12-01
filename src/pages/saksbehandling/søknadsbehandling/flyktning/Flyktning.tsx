import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Loader, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/lib/string';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { FlyktningFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Behandlingsstatus } from '~types/Behandling';
import { Vilkårstatus } from '~types/Behandlingsinformasjon';
import { UføreResultat } from '~types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import { erUnderkjent, erVilkårsvurderingerVurdertAvslag } from '~utils/behandling/behandlingUtils';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './flyktning-nb';

interface FormData {
    status: Nullable<Vilkårstatus>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt, Vilkårstatus.Uavklart],
                'Du må velge om vilkåret er oppfylt'
            ),
        begrunnelse: yup.string().defined(),
    })
    .required();

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);

    const initialValues: FormData = {
        status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null,
        begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Flyktning,
        (values) => eqFormData.equals(values, initialValues)
    );

    const goToVedtak = () => {
        history.push(
            Routes.saksbehandlingSendTilAttestering.createURL({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            })
        );
    };

    const handleLagreOgFortsettSenere = async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: {
                        status: values.status,
                        begrunnelse: values.begrunnelse,
                    },
                },
            },
            () => {
                clearDraft();
                history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            }
        );
    };

    const handleSave = async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            if (erVilkårsvurderingerVurdertAvslag(props.behandling) || erUnderkjent(props.behandling)) {
                goToVedtak();
                return;
            }

            history.push(props.nesteUrl);
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: {
                        status: values.status,
                        begrunnelse: values.begrunnelse,
                    },
                },
            },
            (behandling) => {
                clearDraft();
                if (behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                    goToVedtak();
                    return;
                }
                history.push(props.nesteUrl);
            }
        );
    };

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
                    <form onSubmit={form.handleSubmit(handleSave, focusAfterTimeout(feiloppsummeringRef))}>
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
                        <div className={sharedStyles.textareaContainer}>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label={formatMessage('input.label.begrunnelse')}
                                        error={fieldState.error?.message}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                        </div>

                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <Loader title={formatMessage('display.lagre.lagrer')} />,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}

                        {vilGiTidligAvslag && (
                            <Alert className={sharedStyles.avslagAdvarsel} variant="info">
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
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleLagreOgFortsettSenere,
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            nesteKnappTekst={vilGiTidligAvslag ? formatMessage('knapp.tilVedtaket') : undefined}
                        />
                    </form>
                ),
                right: <FlyktningFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Flyktning;
