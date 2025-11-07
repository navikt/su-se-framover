import * as RemoteData from '@devexperts/remote-data-ts';
import { TextField } from '@navikt/ds-react';
import { Controller } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/inputs/multiPeriodeVelger/MultiPeriodeVelger';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { useI18n } from '~src/lib/i18n';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';

import messages from '../VilkårOgGrunnlagForms-nb';
import { VilkårFormProps } from '../VilkårOgGrunnlagFormUtils';
import { lagTomUføreperiode, UførhetFormData } from './UførhetFormUtils';
import styles from './uførhet.module.less';

export const UførhetForm = ({ form, ...props }: VilkårFormProps<UførhetFormData>) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <FormWrapper form={form} {...props}>
            <>
                <MultiPeriodeVelger
                    name={'grunnlag'}
                    controller={form.control}
                    appendNyPeriode={lagTomUføreperiode}
                    periodeConfig={{
                        minDate: props.minOgMaxPeriode.fraOgMed,
                        maxDate: props.minOgMaxPeriode.tilOgMed,
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
                {RemoteData.isSuccess(props.neste.savingState) && 'feilmeldinger' in props.neste.savingState.value && (
                    <UtfallSomIkkeStøttes feilmeldinger={props.neste.savingState.value.feilmeldinger} />
                )}
            </>
        </FormWrapper>
    );
};
