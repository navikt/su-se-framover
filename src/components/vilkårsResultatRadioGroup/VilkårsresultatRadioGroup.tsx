import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, FieldValues, Path, UnPackAsyncDefaultValues } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Vilkårstatus } from '~src/types/Vilkår';

import messages from './vilkårsResultatRadioGroup-nb';

interface Props<T extends FieldValues> {
    className?: string;
    name: string;
    controller: Control<T>;
    legend: string;
    uavklartConfig?: {
        tekst?: string;
        verdi?: string;
    };
    ommvendtVilkårStatus?: boolean;
}

const VilkårsResultatRadioGroup = <T extends FieldValues>(props: Props<T>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={props.className}>
            <Controller
                control={props.controller}
                name={props.name as Path<UnPackAsyncDefaultValues<T>>}
                render={({ field, fieldState }) => (
                    <RadioGroup {...field} legend={props.legend} error={fieldState.error?.message}>
                        <Radio
                            value={
                                props.ommvendtVilkårStatus ? Vilkårstatus.VilkårIkkeOppfylt : Vilkårstatus.VilkårOppfylt
                            }
                        >
                            {formatMessage('radio.label.ja')}
                        </Radio>
                        <Radio
                            value={
                                props.ommvendtVilkårStatus ? Vilkårstatus.VilkårOppfylt : Vilkårstatus.VilkårIkkeOppfylt
                            }
                        >
                            {formatMessage('radio.label.nei')}
                        </Radio>
                        {props.uavklartConfig && (
                            <Radio value={props.uavklartConfig?.verdi ?? Vilkårstatus.Uavklart}>
                                {props.uavklartConfig?.tekst ?? formatMessage('radio.label.uavklart')}
                            </Radio>
                        )}
                    </RadioGroup>
                )}
            />
        </div>
    );
};

export default VilkårsResultatRadioGroup;
