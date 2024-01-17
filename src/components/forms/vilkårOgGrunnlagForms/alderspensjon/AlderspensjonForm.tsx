import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';

import messages from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/alderspensjon-nb';
import {
    AlderspensjonFormData,
    alderspensjonSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/alderspensjon/AlderspensjonFormUtils';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { PensjonsOpplysningerUtvidetSvar } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

interface Props extends VilkårsvurderingBaseProps {
    save: (values: AlderspensjonFormData, onSuccess: () => void) => void;
    savingState: ApiResult<Søknadsbehandling>;
}

export const AlderspensjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const form = useForm<AlderspensjonFormData>({
        defaultValues: {
            folketrygd:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                    .folketrygd ?? null,
            andreNorske:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                    .andreNorske ?? null,
            utenlandske:
                props.behandling.grunnlagsdataOgVilkårsvurderinger.pensjon?.vurderinger[0]?.pensjonsopplysninger
                    .utenlandske ?? null,
        },
        resolver: yupResolver(alderspensjonSchema),
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
            <>
                <Controller
                    control={form.control}
                    name={'folketrygd'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('label.folketrygd')}
                            error={fieldState.error?.message}
                            value={field.value ?? ''}
                        >
                            <Radio id={field.name} value={PensjonsOpplysningerUtvidetSvar.JA} ref={field.ref}>
                                {formatMessage('radio.label.ja')}
                            </Radio>
                            <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                {formatMessage('radio.label.nei')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
                <Controller
                    control={form.control}
                    name={'andreNorske'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('label.andreNorske')}
                            error={fieldState.error?.message}
                            value={field.value ?? ''}
                        >
                            <Radio id={field.name} value={PensjonsOpplysningerUtvidetSvar.JA} ref={field.ref}>
                                {formatMessage('radio.label.ja')}
                            </Radio>
                            <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                {formatMessage('radio.label.nei')}
                            </Radio>
                            <Radio value={PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT}>
                                {formatMessage('radio.label.ikkeAktuelt')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
                <Controller
                    control={form.control}
                    name={'utenlandske'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('label.utenlandske')}
                            error={fieldState.error?.message}
                            value={field.value ?? ''}
                        >
                            <Radio id={field.name} value={PensjonsOpplysningerUtvidetSvar.JA} ref={field.ref}>
                                {formatMessage('radio.label.ja')}
                            </Radio>
                            <Radio value={PensjonsOpplysningerUtvidetSvar.NEI}>
                                {formatMessage('radio.label.nei')}
                            </Radio>
                            <Radio value={PensjonsOpplysningerUtvidetSvar.IKKE_AKTUELT}>
                                {formatMessage('radio.label.ikkeAktuelt')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
            </>
        </FormWrapper>
    );
};
