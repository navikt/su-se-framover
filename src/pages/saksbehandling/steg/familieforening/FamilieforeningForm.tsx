import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/steg/familieforening/familieforening-nb';
import { FormData, schema } from '~src/pages/saksbehandling/steg/familieforening/types';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Behandling } from '~src/types/Behandling';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

interface Props extends VilkårsvurderingBaseProps {
    save: (values: FormData, onSuccess: () => void) => void;
    savingState: ApiResult<Behandling>;
    avsluttUrl: string;
}

export const FamilieforeningForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const form = useForm<FormData>({
        defaultValues: {
            familieforening:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.familiegjenforening?.vurderinger[0]?.resultat ??
                null,
        },
        resolver: yupResolver(schema),
    });

    return (
        <SøknadsbehandlingWrapper
            form={form}
            save={props.save}
            savingState={props.savingState}
            avsluttUrl={props.avsluttUrl}
            forrigeUrl={props.forrigeUrl}
            nesteUrl={props.nesteUrl}
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
        </SøknadsbehandlingWrapper>
    );
};
