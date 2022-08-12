import * as RemoteData from '@devexperts/remote-data-ts';
import React from 'react';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';

import messages from '../VilkårForms-nb';
import { VilkårFormProps } from '../VilkårFormUtils';

import styles from './flyktningForm.module.less';
import { FlyktningVilkårFormData, nyVurderingsperiodeFlyktningMedEllerUtenPeriode } from './FlyktningFormUtils';

interface Props extends VilkårFormProps<FlyktningVilkårFormData> {
    children?: React.ReactNode;
    nesteknappTekst?: string;
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
}

const FlyktningForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper
            form={props.form}
            save={props.onFormSubmit}
            savingState={props.savingState}
            avsluttUrl={props.avsluttUrl}
            forrigeUrl={props.forrigeUrl}
            nesteUrl={props.nesteUrl}
            onTilbakeClickOverride={props.onTilbakeClickOverride}
            nesteKnappTekst={props.nesteknappTekst}
        >
            <>
                <MultiPeriodeVelger
                    name="flyktning"
                    className={styles.multiperiodeVelger}
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodeFlyktningMedEllerUtenPeriode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: string) => (
                        <VilkårsResultatRadioGroup
                            name={`${nameAndIdx}.resultat`}
                            legend={formatMessage('flyktning.vilkår')}
                            controller={props.form.control}
                            uavklartConfig={
                                props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' ? {} : undefined
                            }
                        />
                    )}
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                />
                {props.children}
                {RemoteData.isSuccess(props.savingState) && 'feilmeldinger' in props.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};

export default FlyktningForm;
