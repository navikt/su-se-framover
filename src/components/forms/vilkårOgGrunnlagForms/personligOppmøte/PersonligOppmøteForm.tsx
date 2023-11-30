import * as RemoteData from '@devexperts/remote-data-ts';
import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøteVilkår';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import {
    HarMøttPersonlig,
    nyVurderingsperiodePersonligOppmøteMedEllerUtenPeriode,
    PersonligOppmøteVilkårFormData,
} from './PersonligOppmøteFormUtils';

interface Props extends VilkårFormProps<PersonligOppmøteVilkårFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
    children?: React.ReactNode;
}

const PersonligOppmøteForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name="personligOppmøte"
                    controller={props.form.control}
                    appendNyPeriode={nyVurderingsperiodePersonligOppmøteMedEllerUtenPeriode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx: `personligOppmøte.${number}`) => (
                        <>
                            <Controller
                                control={props.form.control}
                                name={`${nameAndIdx}.møttPersonlig`}
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        {...field}
                                        legend={formatMessage('personligOppmøte.vilkår')}
                                        error={fieldState.error?.message}
                                    >
                                        <Radio value={HarMøttPersonlig.Ja}>{formatMessage('radio.label.ja')}</Radio>
                                        <Radio value={HarMøttPersonlig.Nei}>{formatMessage('radio.label.nei')}</Radio>
                                        {props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling' && (
                                            <Radio value={HarMøttPersonlig.Uavklart}>
                                                {formatMessage('radio.label.uavklart')}
                                            </Radio>
                                        )}
                                    </RadioGroup>
                                )}
                            />

                            {props.form.watch(`${nameAndIdx}.møttPersonlig`) === HarMøttPersonlig.Nei && (
                                <Controller
                                    control={props.form.control}
                                    name={`${nameAndIdx}.årsakForManglendePersonligOppmøte`}
                                    render={({ field, fieldState }) => (
                                        <RadioGroup
                                            {...field}
                                            legend={formatMessage('personligOppmøte.ikkeMøttPersonlig.vilkår')}
                                            error={fieldState.error?.message}
                                        >
                                            {Object.values(PersonligOppmøteÅrsak)
                                                .filter(
                                                    (årsak) =>
                                                        årsak !== PersonligOppmøteÅrsak.MøttPersonlig &&
                                                        årsak !== PersonligOppmøteÅrsak.Uavklart,
                                                )
                                                .map((årsak) => (
                                                    <Radio key={årsak} value={årsak}>
                                                        {formatMessage(årsak)}
                                                    </Radio>
                                                ))}
                                        </RadioGroup>
                                    )}
                                />
                            )}
                        </>
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

export default PersonligOppmøteForm;
