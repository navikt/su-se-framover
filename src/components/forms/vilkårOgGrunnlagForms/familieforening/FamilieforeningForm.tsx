import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårstatus } from '~src/types/Vilkår';

import messages from './familieforening-nb';
import { FamilieforeningFormData, familieforeningSchema } from './FamilieforeningFormUtils';

interface Props extends VilkårsvurderingBaseProps {
    save: (values: FamilieforeningFormData, onSuccess: () => void) => void;
    savingState: ApiResult<Søknadsbehandling>;
    avsluttUrl: string;
}

export const FamilieforeningForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const form = useForm<FamilieforeningFormData>({
        defaultValues: {
            familieforening:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.vurderinger[0]?.resultat ??
                null,
        },
        resolver: yupResolver(familieforeningSchema),
    });

    return (
        <FormWrapper
            form={form}
            neste={{
                onClick: props.save,
                savingState: props.savingState,
                url: props.nesteUrl,
            }}
            tilbake={{
                url: props.forrigeUrl,
            }}
            {...props}
        >
            <Controller
                control={form.control}
                name={'familieforening'}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        legend={formatMessage('label.familieforening')}
                        error={fieldState.error?.message}
                        value={field.value ?? ''}
                    >
                        <Radio id={field.name} value={Vilkårstatus.VilkårIkkeOppfylt} ref={field.ref}>
                            {formatMessage('radio.label.ja')}
                        </Radio>
                        <Radio value={Vilkårstatus.VilkårOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                    </RadioGroup>
                )}
            />
        </FormWrapper>
    );
};
