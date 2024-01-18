import * as RemoteData from '@devexperts/remote-data-ts';

import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import {
    InstitusjonsoppholdVilkårFormData,
    nyVurderingsperiodeInstitusjonsoppholdMedEllerUtenPeriode,
} from './InstitusjonsoppholdFormUtils';

interface Props extends VilkårFormProps<InstitusjonsoppholdVilkårFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
}

const InstitusjonsoppholdForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="institusjonsopphold"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeInstitusjonsoppholdMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: string) => (
                        <VilkårsResultatRadioGroup
                            name={`${nameAndIdx}.resultat`}
                            legend={formatMessage('institusjonsopphold.vilkår')}
                            controller={props.form.control}
                            uavklartConfig={
                                props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' ? {} : undefined
                            }
                            ommvendtVilkårStatus
                        />
                    )}
                    {...props}
                />
                {RemoteData.isSuccess(props.neste.savingState) && 'feilmeldinger' in props.neste.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.neste.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default InstitusjonsoppholdForm;
