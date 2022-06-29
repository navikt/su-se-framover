import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

import messages from './vilkårsResultatRadioGroup-nb';

interface Props<T> {
    name: Path<T>;
    legend: string;
    controller: Control<T>;
}

const VilkårsResultatRadioGroup = <T extends FieldValues>(props: Props<T>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <Controller
            control={props.controller}
            name={props.name}
            render={({ field, fieldState }) => (
                <RadioGroup
                    legend={props.legend}
                    error={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value ?? ''}
                >
                    <Radio id={field.name} value={Vilkårstatus.VilkårOppfylt} ref={field.ref}>
                        {formatMessage('radio.label.ja')}
                    </Radio>
                    <Radio value={Vilkårstatus.VilkårIkkeOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                    <Radio value={Vilkårstatus.Uavklart}>{formatMessage('radio.label.uavklart')}</Radio>
                </RadioGroup>
            )}
        />
    );
};

export default VilkårsResultatRadioGroup;
