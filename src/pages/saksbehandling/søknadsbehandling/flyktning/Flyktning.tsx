import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eq } from 'fp-ts/lib/Eq';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { FlyktningFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { Behandlingsstatus } from '~types/Behandling';
import { Flyktning as FlyktningType, FlyktningStatus, UførhetStatus } from '~types/Behandlingsinformasjon';
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

const eqFlyktning: Eq<Nullable<FlyktningType>> = {
    equals: (flyktning1, flyktning2) =>
        flyktning1?.status === flyktning2?.status && flyktning1?.begrunnelse === flyktning2?.begrunnelse,
};

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

        const flyktningValues: FlyktningType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFlyktning.equals(flyktningValues, props.behandling.behandlingsinformasjon.flyktning)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: flyktningValues,
                },
            },
            () => {
                history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            }
        );
    };

    const handleSave = async (values: FormData) => {
        if (!values.status) return;

        const flyktningValues: FlyktningType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFlyktning.equals(flyktningValues, props.behandling.behandlingsinformasjon.flyktning)) {
            if (erVilkårsvurderingerVurdertAvslag(props.behandling) || erUnderkjent(props.behandling)) {
                goToVedtak();
                return;
            }

            history.push(props.nesteUrl);
            return;
        }

        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: flyktningValues,
                },
            },
            (behandling) => {
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
        defaultValues: {
            status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
        },
        resolver: yupResolver(schema),
    });

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
                                () => (
                                    <AlertStripe type="feil">
                                        {formatMessage('display.lagre.lagringFeilet')}
                                    </AlertStripe>
                                ),
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
                            onLagreOgFortsettSenereClick={() =>
                                form.handleSubmit(handleLagreOgFortsettSenere, focusAfterTimeout(feiloppsummeringRef))
                            }
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
