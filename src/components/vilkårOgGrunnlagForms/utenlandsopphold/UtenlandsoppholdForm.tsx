import * as RemoteData from '@devexperts/remote-data-ts';
import React from 'react';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import {
    UtenlandsoppholdVilkårFormData,
    nyVurderingsperiodeUtenlandsoppholdMedEllerUtenPeriode,
} from './UtenlandsoppholdFormUtils';

interface Props extends VilkårFormProps<UtenlandsoppholdVilkårFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
}

const UtenlandsoppholdForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper save={props.onFormSubmit} {...props}>
            <>
                <MultiPeriodeVelger
                    name="utenlandsopphold"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeUtenlandsoppholdMedEllerUtenPeriode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: string) => (
                        <VilkårsResultatRadioGroup
                            name={`${nameAndIdx}.resultat`}
                            legend={formatMessage('utenlandsopphold.vilkår')}
                            controller={props.form.control}
                            uavklartConfig={
                                props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' ? {} : undefined
                            }
                            ommvendtVilkårStatus
                        />
                    )}
                    {...props}
                />
                {RemoteData.isSuccess(props.savingState) && 'feilmeldinger' in props.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default UtenlandsoppholdForm;
