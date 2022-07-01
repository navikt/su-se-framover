import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { UtenlandsOppholdFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './oppholdIUtlandet-nb';

interface FormData {
    status: Nullable<Utenlandsoppholdstatus>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                Object.values(Utenlandsoppholdstatus),
                'Du må velge om søker har planlagt å oppholde seg for lenge i utlandet'
            ),
    })
    .required();

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreUtenlandsopphold] = useAsyncActionCreator(sakSlice.lagreUtenlandsopphold);
    const initialValues = {
        status: props.behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger[0]?.status ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.OppholdIUtlandet,
        (values) => eqFormData.equals(values, initialValues)
    );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: FormData, onSuccess: () => void) => {
        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            onSuccess();
            return;
        }

        await lagreUtenlandsopphold(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                status: values.status!,
                periode: {
                    fraOgMed: props.behandling.stønadsperiode?.periode.fraOgMed ?? toIsoDateOnlyString(new Date()),
                    tilOgMed:
                        props.behandling.stønadsperiode?.periode.tilOgMed ??
                        toIsoDateOnlyString(sluttenAvMåneden(new Date())),
                },
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FormWrapper
                        form={form}
                        save={handleSave}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    legend={formatMessage('radio.oppholdIUtland.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    onChange={field.onChange}
                                    name={field.name}
                                    value={field.value ?? ''}
                                >
                                    <Radio
                                        id={field.name}
                                        ref={field.ref}
                                        value={Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet}
                                    >
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={Utenlandsoppholdstatus.SkalHoldeSegINorge}>
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio value={Utenlandsoppholdstatus.Uavklart}>
                                        {formatMessage('radio.label.uavklart')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />
                    </FormWrapper>
                ),
                right: <UtenlandsOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
