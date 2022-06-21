import * as React from 'react';

import { yupResolver } from '~node_modules/@hookform/resolvers/yup/dist/yup';
import { Radio, RadioGroup } from '~node_modules/@navikt/ds-react';
import { Controller, useForm } from '~node_modules/react-hook-form';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import messages from '~src/pages/saksbehandling/steg/alderspensjon/alderspensjon-nb';
import { FormData, schema } from '~src/pages/saksbehandling/steg/alderspensjon/types';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Behandling } from '~src/types/Behandling';
import { PensjonsOpplysningerUtvidetSvar } from '~src/types/grunnlagsdataOgVilkårsvurderinger/alder/Aldersvilkår';

interface Props extends VilkårsvurderingBaseProps {
    save: (values: FormData, onSuccess: () => void) => void;
    savingState: ApiResult<Behandling>;
    avsluttUrl: string;
}

export const AlderspensjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const form = useForm<FormData>({
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
        </SøknadsbehandlingWrapper>
    );
};
