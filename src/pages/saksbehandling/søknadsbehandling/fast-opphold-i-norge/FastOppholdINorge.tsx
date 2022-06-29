import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FastOppholdFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FastOppholdFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './fastOppholdINorge-nb';

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
            .oneOf(Object.values(Vilkårstatus), 'Du må velge om søker oppholder seg fast i norge'),
    })
    .required();

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);

    const initialValues = {
        status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.FastOppholdINorge,
        (values) => eqFormData.equals(values, initialValues)
    );

    const handleSave = async (values: FormData, onSuccess: () => void) => {
        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            onSuccess();
            return;
        }
        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    fastOppholdINorge: {
                        status: values.status!,
                    },
                },
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <SøknadsbehandlingWrapper
                        form={form}
                        save={handleSave}
                        savingState={status}
                        avsluttUrl={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    legend={formatMessage('radio.fastOpphold.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    name={field.name}
                                >
                                    <Radio id={field.name} value={Vilkårstatus.VilkårOppfylt}>
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={Vilkårstatus.VilkårIkkeOppfylt}>
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio value={Vilkårstatus.Uavklart}>{formatMessage('radio.label.uavklart')}</Radio>
                                </RadioGroup>
                            )}
                        />
                    </SøknadsbehandlingWrapper>
                ),
                right: <FastOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default FastOppholdINorge;
