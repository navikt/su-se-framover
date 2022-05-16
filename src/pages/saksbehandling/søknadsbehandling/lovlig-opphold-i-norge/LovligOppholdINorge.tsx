import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { RadioGroup, Radio } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { LovligOppholdFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/LovligOppholdFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../vurderingknapper/Vurderingknapper';

import messages from './lovligOppholdINorge-nb';

interface FormData {
    status: Nullable<Vilkårstatus>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed<Vilkårstatus>()
            .defined()
            .oneOf(Object.values(Vilkårstatus), 'Du må velge om søker har lovlig opphold i Norge'),
    })
    .required();

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const navigate = useNavigate();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);
    const initialValues = {
        status: props.behandling.behandlingsinformasjon.lovligOpphold?.status ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.LovligOpphold,
        (values) => eqFormData.equals(values, initialValues)
    );

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            navigate(nesteUrl);
            return;
        }

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    lovligOpphold: {
                        status: values.status,
                    },
                },
            },
            () => {
                clearDraft();
                navigate(nesteUrl);
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
                                <RadioGroup
                                    legend={formatMessage('radio.lovligOpphold.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    onChange={field.onChange}
                                    value={field.value ?? ''}
                                >
                                    <Radio id={field.name} value={Vilkårstatus.VilkårOppfylt} ref={field.ref}>
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={Vilkårstatus.VilkårIkkeOppfylt}>
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio value={Vilkårstatus.Uavklart}>{formatMessage('radio.label.uavklart')}</Radio>
                                </RadioGroup>
                            )}
                        />

                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                navigate(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            loading={RemoteData.isPending(status)}
                        />
                    </form>
                ),
                right: <LovligOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default LovligOppholdINorge;
