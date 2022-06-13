import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import { Uføregrunnlag } from '~src/api/revurderingApi';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { FormData, UføreperiodeFormData } from '~src/pages/saksbehandling/steg/uføre/types';
import { UføreperiodeForm } from '~src/pages/saksbehandling/steg/uføre/UføreperiodeForm';
import * as styles from '~src/pages/saksbehandling/steg/uføre/uførhet.module.less';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { Behandling } from '~src/types/Behandling';

import messages from './uførhet-nb';

interface Props {
    form: UseFormReturn<FormData>;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    forrige: { url: string; visModal: boolean };
    nesteUrl: string;
    avsluttUrl: string;
    onFormSubmit: (values: FormData, onSuccess: () => void) => void;
    savingState: ApiResult<Uføregrunnlag | Behandling>;
    erSaksbehandling: boolean;
}

export const UførhetForm = ({ form, onFormSubmit, savingState, ...props }: Props) => {
    const { formatMessage } = useI18n({ messages });

    const lagTomUføreperiode = (): UføreperiodeFormData => ({
        id: uuid(),
        periode: {
            fraOgMed: null,
            tilOgMed: null,
        },
        forventetInntekt: '',
        oppfylt: null,
        uføregrad: '',
    });

    const grunnlagValues = useFieldArray({
        control: form.control,
        name: 'grunnlag',
    });

    useEffect(() => {
        if (grunnlagValues.fields.length === 0) {
            grunnlagValues.append({
                ...lagTomUføreperiode(),
                periode: {
                    fraOgMed: props.minDate,
                    tilOgMed: props.maxDate,
                },
            });
        }
    }, [grunnlagValues.fields]);

    return (
        <SøknadsbehandlingWrapper
            form={form}
            save={onFormSubmit}
            savingState={savingState}
            avsluttUrl={props.avsluttUrl}
            forrigeUrl={props.forrige.url}
            visModal={props.forrige.visModal}
            nesteUrl={props.nesteUrl}
        >
            <>
                <ul className={styles.periodeliste}>
                    {grunnlagValues.fields.map((item, idx) => (
                        <li key={item.id}>
                            <UføreperiodeForm
                                item={item}
                                index={idx}
                                control={form.control}
                                minDate={props.minDate}
                                maxDate={props.maxDate}
                                onRemoveClick={
                                    grunnlagValues.fields.length <= 1 ? undefined : () => grunnlagValues.remove(idx)
                                }
                                resetUføregradOgForventetInntekt={() => {
                                    form.setValue(`grunnlag.${idx}.uføregrad`, '');
                                    form.setValue(`grunnlag.${idx}.forventetInntekt`, '');
                                }}
                                kanVelgeUføresakTilBehandling={props.erSaksbehandling}
                                setValue={form.setValue}
                                errors={form.formState.errors}
                            />
                        </li>
                    ))}
                </ul>
                <div className={styles.nyperiodeContainer}>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => grunnlagValues.append(lagTomUføreperiode(), { shouldFocus: true })}
                    >
                        {formatMessage('button.nyPeriode.label')}
                    </Button>
                </div>
            </>
        </SøknadsbehandlingWrapper>
    );
};
