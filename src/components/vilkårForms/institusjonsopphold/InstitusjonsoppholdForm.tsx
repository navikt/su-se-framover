import * as RemoteData from '@devexperts/remote-data-ts';
import React from 'react';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';

import messages from '../VilkårForms-nb';
import { VilkårFormProps } from '../VilkårFormUtils';

import styles from './institusjonsoppholdForm.module.less';
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
        <FormWrapper save={props.onFormSubmit} {...props}>
            <>
                <MultiPeriodeVelger
                    name="institusjonsopphold"
                    className={styles.multiperiodeVelger}
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeInstitusjonsoppholdMedEllerUtenPeriode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
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
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                />
                {RemoteData.isSuccess(props.savingState) && 'feilmeldinger' in props.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default InstitusjonsoppholdForm;
