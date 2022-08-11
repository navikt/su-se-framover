import { TextField } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

import { Uføregrunnlag } from '~src/api/revurderingApi';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import { FormData, lagTomUføreperiode } from '~src/components/vilkårForms/uførhet/UførhetFormUtils';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';

import * as styles from './/uførhet.module.less';
import messages from './uførhet-nb';

interface Props {
    form: UseFormReturn<FormData>;
    minDate: Date;
    maxDate: Date;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
    onFormSubmit: (values: FormData, onSuccess: () => void) => void;
    savingState: ApiResult<Uføregrunnlag | Søknadsbehandling>;
    erSaksbehandling: boolean;
    onTilbakeClickOverride?: () => void;
}

export const UførhetForm = ({ form, onFormSubmit, savingState, ...props }: Props) => {
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
                        minFraOgMed: props.minDate,
                        maxTilOgMed: props.maxDate,
                    }}
                    childrenOverDato
                    getChild={(nameAndIdx) => (
                        <div>
                            <VilkårsResultatRadioGroup
                                className={styles.vilkårInput}
                                name={`${nameAndIdx}.oppfylt`}
                                legend={formatMessage('input.erVilkårOppfylt.label')}
                                controller={form.control}
                                uavklartConfig={
                                    props.erSaksbehandling
                                        ? {
                                              tekst: formatMessage('radio.label.uføresakTilBehandling'),
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
                                                label={formatMessage('input.uføregrad.label')}
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
                                                label={formatMessage('input.forventetInntekt.label')}
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
