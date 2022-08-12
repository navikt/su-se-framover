import { TextField } from '@navikt/ds-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import { UførhetFormData, lagTomUføreperiode } from '~src/components/vilkårForms/uførhet/UførhetFormUtils';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

import messages from '../VilkårForms-nb';
import { VilkårFormProps } from '../VilkårFormUtils';

import * as styles from './/uførhet.module.less';

export const UførhetForm = ({ form, onFormSubmit, savingState, ...props }: VilkårFormProps<UførhetFormData>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper
            form={form}
            save={onFormSubmit}
            savingState={savingState}
            avsluttUrl={props.avsluttUrl}
            forrigeUrl={props.forrigeUrl}
            nesteUrl={props.nesteUrl}
            onTilbakeClickOverride={props.onTilbakeClickOverride}
        >
            <>
                <MultiPeriodeVelger
                    name={'grunnlag'}
                    controller={form.control}
                    appendNyPeriode={lagTomUføreperiode}
                    periodeConfig={{
                        minFraOgMed: props.minOgMaxPeriode.fraOgMed,
                        maxTilOgMed: props.minOgMaxPeriode.tilOgMed,
                    }}
                    childrenOverDato
                    getChild={(nameAndIdx) => (
                        <div>
                            <VilkårsResultatRadioGroup
                                className={styles.vilkårInput}
                                name={`${nameAndIdx}.oppfylt`}
                                legend={formatMessage('uførhet.vilkår')}
                                controller={form.control}
                                uavklartConfig={
                                    props.søknadsbehandlingEllerRevurdering === 'Søknadsbehandling'
                                        ? {
                                              tekst: formatMessage('uførhet.radio.label.uføresakTilBehandling'),
                                              verdi: UføreResultat.HarUføresakTilBehandling,
                                          }
                                        : undefined
                                }
                            />

                            {form.watch(`${nameAndIdx}.oppfylt`) === UføreResultat.VilkårOppfylt && (
                                <div className={styles.horizontal}>
                                    <Controller
                                        control={form.control}
                                        name={`${nameAndIdx}.uføregrad`}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                id={field.name}
                                                label={formatMessage('uførhet.input.uføregrad.label')}
                                                error={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name={`${nameAndIdx}.forventetInntekt`}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                id={field.name}
                                                label={formatMessage('uførhet.input.forventetInntekt.label')}
                                                error={fieldState.error?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                />
            </>
        </FormWrapper>
    );
};
