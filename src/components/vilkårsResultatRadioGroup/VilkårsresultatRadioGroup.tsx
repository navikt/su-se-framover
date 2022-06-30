import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';

import messages from './vilkårsResultatRadioGroup-nb';

interface Props<T> {
    navnOgIdx: Path<T>;
    controller: Control<T>;
    legend: string;
}

const VilkårsResultatRadioGroup = <T extends FieldValues>(props: Props<T>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <Controller
                control={props.controller}
                name={`${props.navnOgIdx}.resultat` as Path<T>}
                render={({ field, fieldState }) => (
                    <RadioGroup {...field} legend={props.legend} error={fieldState.error?.message}>
                        <Radio value={Vilkårstatus.VilkårOppfylt}>{formatMessage('radio.label.ja')}</Radio>
                        <Radio value={Vilkårstatus.VilkårIkkeOppfylt}>{formatMessage('radio.label.nei')}</Radio>
                        <Radio value={Vilkårstatus.Uavklart}>{formatMessage('radio.label.uavklart')}</Radio>
                    </RadioGroup>
                )}
            />
        </div>
    );
};

export default VilkårsResultatRadioGroup;
