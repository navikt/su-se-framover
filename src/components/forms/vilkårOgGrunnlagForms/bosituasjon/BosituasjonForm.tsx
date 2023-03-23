import React from 'react';
import { Controller } from 'react-hook-form';

import { FnrInput } from '~src/components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';

import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';

import messages from './BosituasjonForm-nb';
import styles from './BosituasjonForm.module.less';
import { BosituasjonGrunnlagFormData, nyBosituasjon } from './BosituasjonFormUtils';

interface Props extends VilkårFormProps<BosituasjonGrunnlagFormData> {
    begrensTilEnPeriode?: boolean;
    skalIkkeKunneVelgePeriode?: boolean;
}

const BosituasjonForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper {...props}>
            <>
                <MultiPeriodeVelger
                    name={'bosituasjoner'}
                    begrensTilEnPeriode={props.begrensTilEnPeriode}
                    controller={props.form.control}
                    appendNyPeriode={nyBosituasjon}
                    skalIkkeKunneVelgePeriode={props.skalIkkeKunneVelgePeriode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
                    }}
                    getChild={(nameAndIdx) => {
                        const watch = props.form.watch(nameAndIdx);
                        return (
                            <div className={styles.formItemInputContainer}>
                                <Controller
                                    control={props.form.control}
                                    name={`${nameAndIdx}.harEPS`}
                                    render={({ field, fieldState }) => (
                                        <BooleanRadioGroup
                                            legend={formatMessage('form.harSøkerEPS')}
                                            error={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                {watch.harEPS && (
                                    <div className={styles.epsFormContainer}>
                                        <Controller
                                            control={props.form.control}
                                            name={`${nameAndIdx}.epsFnr`}
                                            render={({ field, fieldState }) => (
                                                <FnrInput
                                                    label={formatMessage('form.epsFnr')}
                                                    inputId="epsFnr"
                                                    name={`${nameAndIdx}.epsFnr`}
                                                    onFnrChange={field.onChange}
                                                    fnr={field.value ?? ''}
                                                    feil={fieldState.error?.message}
                                                    getHentetPerson={(person) => {
                                                        props.form.setValue(`${nameAndIdx}`, {
                                                            ...watch,
                                                            epsAlder: person?.fødsel?.alder ?? null,
                                                        });
                                                    }}
                                                />
                                            )}
                                        />
                                        {watch.epsAlder && watch.epsAlder < 67 && (
                                            <Controller
                                                control={props.form.control}
                                                name={`${nameAndIdx}.erEPSUførFlyktning`}
                                                render={({ field, fieldState }) => (
                                                    <BooleanRadioGroup
                                                        legend={formatMessage('form.erEPSUførFlyktning')}
                                                        error={fieldState.error?.message}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        )}
                                    </div>
                                )}
                                {watch.harEPS === false && (
                                    <Controller
                                        control={props.form.control}
                                        name={`${nameAndIdx}.delerBolig`}
                                        render={({ field, fieldState }) => (
                                            <BooleanRadioGroup
                                                legend={formatMessage('form.delerBolig')}
                                                error={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                )}
                            </div>
                        );
                    }}
                />
            </>
        </FormWrapper>
    );
};

export default BosituasjonForm;
