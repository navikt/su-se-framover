import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/lib/string';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
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
import { FlyktningStatus, UførhetStatus } from '~types/Behandlingsinformasjon';
import { Vilkårtype } from '~types/Vilkårsvurdering';
import { erUnderkjent, erVilkårsvurderingerVurdertAvslag } from '~utils/behandling/behandlingUtils';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './flyktning-nb';

interface FormData {
    status: Nullable<FlyktningStatus>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf(
            [FlyktningStatus.VilkårOppfylt, FlyktningStatus.VilkårIkkeOppfylt, FlyktningStatus.Uavklart],
            'Du må velge om vilkåret er oppfylt'
        ),
    begrunnelse: yup.string().defined(),
});

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

    const vilGiTidligAvslag = useMemo(() => {
        return (
            props.behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
            watchStatus === FlyktningStatus.VilkårIkkeOppfylt
        );
    }, [watchStatus, props.behandling.behandlingsinformasjon.uførhet]);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSave, focusAfterTimeout(feiloppsummeringRef))}>
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGruppe
                                    legend={formatMessage('radio.flyktning.legend')}
                                    feil={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                >
                                    <Radio
                                        id={field.name}
                                        label={formatMessage('radio.label.ja')}
                                        name={field.name}
                                        onChange={() => field.onChange(FlyktningStatus.VilkårOppfylt)}
                                        defaultChecked={field.value === FlyktningStatus.VilkårOppfylt}
                                        radioRef={field.ref}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.nei')}
                                        name={field.name}
                                        onChange={() => field.onChange(FlyktningStatus.VilkårIkkeOppfylt)}
                                        defaultChecked={field.value === FlyktningStatus.VilkårIkkeOppfylt}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.uavklart')}
                                        name={field.name}
                                        onChange={() => field.onChange(FlyktningStatus.Uavklart)}
                                        defaultChecked={field.value === FlyktningStatus.Uavklart}
                                    />
                                </RadioGruppe>
                            )}
                        />
                        <div className={sharedStyles.textareaContainer}>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label={formatMessage('input.label.begrunnelse')}
                                        feil={fieldState.error?.message}
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
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}

                        {vilGiTidligAvslag && (
                            <AlertStripe className={sharedStyles.avslagAdvarsel} type="info">
                                {formatMessage('display.avslag.advarsel')}
                            </AlertStripe>
                        )}

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            innerRef={feiloppsummeringRef}
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
