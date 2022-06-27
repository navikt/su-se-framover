import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { InstitusjonsoppholdBlokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './institusjonsopphold-nb';

interface InstitusjonsoppholdFormData {
    status: Nullable<Vilkårstatus>;
}

const eqFormData = struct<InstitusjonsoppholdFormData>({
    status: eqNullable(S.Eq),
});

const schema = yup
    .object<InstitusjonsoppholdFormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(Object.values(Vilkårstatus), 'Du må velge om institusjonsoppholdet skal føre til avslag'),
    })
    .required();

const Institusjonsopphold = (props: VilkårsvurderingBaseProps) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);
    const initialValues = {
        status: props.behandling.behandlingsinformasjon.institusjonsopphold?.status ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<InstitusjonsoppholdFormData>(Vilkårtype.Institusjonsopphold, (values) =>
            eqFormData.equals(values, initialValues)
        );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: InstitusjonsoppholdFormData, onSuccess: () => void) => {
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
                    institusjonsopphold: {
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

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <SøknadsbehandlingWrapper
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
                                    legend={formatMessage('radio.institusjonsoppholdFørerTilAvslag.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                >
                                    <Radio id={field.name} value={Vilkårstatus.VilkårIkkeOppfylt} ref={field.ref}>
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={Vilkårstatus.VilkårOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                                    <Radio value={Vilkårstatus.Uavklart}>{formatMessage('radio.label.uavklart')}</Radio>
                                </RadioGroup>
                            )}
                        />
                    </SøknadsbehandlingWrapper>
                ),
                right: <InstitusjonsoppholdBlokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;
