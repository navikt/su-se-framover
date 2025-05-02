import { Radio, RadioGroup } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { Controller } from 'react-hook-form';

import * as RemoteData from '~node_modules/@devexperts/remote-data-ts';
import { VilkårFormProps } from '~src/components/forms/vilkårOgGrunnlagForms/VilkårOgGrunnlagFormUtils.ts';
import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger.tsx';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes.tsx';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { Vilkårstatus } from '~src/types/Vilkår';

import messages from './familieforening-nb';
import {
    FamilieforeningFormData,
    nyVurderingsperiodeFamiliegjenforeningMedEllerUtenPeriode,
} from './FamilieforeningFormUtils';

interface Props extends VilkårFormProps<FamilieforeningFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    children?: ReactNode;
}

export const FamiliegjenforeningForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="familiegjenforening"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeFamiliegjenforeningMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: `familiegjenforening.${number}`) => (
                        <Controller
                            control={props.form.control}
                            name={`${nameAndIdx}.familiegjenforening`}
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
                    )}
                    {...props}
                />
                {props.children}
                {RemoteData.isSuccess(props.neste.savingState) && 'feilmeldinger' in props.neste.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.neste.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};
