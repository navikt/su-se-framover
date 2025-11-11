import * as RemoteData from '@devexperts/remote-data-ts';
import { Select } from '@navikt/ds-react';
import { Controller } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { OpplysningspliktBeksrivelse } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import {
    nyVurderingsperiodeOpplysningspliktMedEllerUtenPeriode,
    OpplysningspliktVilkårFormData,
} from './OpplysningspliktFormUtils';

type Props = VilkårFormProps<OpplysningspliktVilkårFormData>;

const OpplysningspliktForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="opplysningsplikt"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeOpplysningspliktMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    childrenOverDato
                    getChild={(nameAndIdx) => (
                        <Controller
                            control={props.form.control}
                            name={`${nameAndIdx}.beskrivelse`}
                            render={({ field, fieldState }) => (
                                <Select
                                    {...field}
                                    label={formatMessage('opplysningsplikt.select.label')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                >
                                    <option value="">{formatMessage('opplysningsplikt.select.defaultValue')}</option>
                                    {Object.values(OpplysningspliktBeksrivelse).map((beskrivelse) => (
                                        <option value={beskrivelse} key={beskrivelse}>
                                            {formatMessage(beskrivelse)}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    )}
                />
                {RemoteData.isSuccess(props.neste.savingState) && 'feilmeldinger' in props.neste.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.neste.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default OpplysningspliktForm;
