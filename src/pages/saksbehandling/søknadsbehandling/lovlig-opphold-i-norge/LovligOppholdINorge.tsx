import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { LovligOppholdFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/LovligOppholdFaktablokk';
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
import { LovligOppholdStatus } from '~types/Behandlingsinformasjon';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './lovligOppholdINorge-nb';

interface FormData {
    status: Nullable<LovligOppholdStatus>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed<LovligOppholdStatus>()
            .defined()
            .oneOf(Object.values(LovligOppholdStatus), 'Du må velge om søker har lovlig opphold i Norge'),
        begrunnelse: yup.string().defined(),
    })
    .required();

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const initialValues = {
        status: props.behandling.behandlingsinformasjon.lovligOpphold?.status ?? null,
        begrunnelse: props.behandling.behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.LovligOpphold,
        (values) => eqFormData.equals(values, initialValues)
    );

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            history.push(nesteUrl);
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    lovligOpphold: {
                        status: values.status,
                        begrunnelse: values.begrunnelse,
                    },
                },
            },
            () => {
                clearDraft();
                history.push(nesteUrl);
            }
        );
    };

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={form.handleSubmit(handleSave(props.nesteUrl), focusAfterTimeout(feiloppsummeringRef))}
                    >
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGruppe
                                    legend={formatMessage('radio.lovligOpphold.legend')}
                                    feil={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                >
                                    <Radio
                                        id={field.name}
                                        label={formatMessage('radio.label.ja')}
                                        name={field.name}
                                        onChange={() => field.onChange(LovligOppholdStatus.VilkårOppfylt)}
                                        checked={field.value === LovligOppholdStatus.VilkårOppfylt}
                                        radioRef={field.ref}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.nei')}
                                        name={field.name}
                                        onChange={() => field.onChange(LovligOppholdStatus.VilkårIkkeOppfylt)}
                                        checked={field.value === LovligOppholdStatus.VilkårIkkeOppfylt}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.uavklart')}
                                        name={field.name}
                                        onChange={() => field.onChange(LovligOppholdStatus.Uavklart)}
                                        checked={field.value === LovligOppholdStatus.Uavklart}
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
                                        {...field}
                                        value={field.value ?? ''}
                                        feil={fieldState.error?.message}
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
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                        />
                    </form>
                ),
                right: <LovligOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default LovligOppholdINorge;
