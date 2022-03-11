import * as RemoteData from '@devexperts/remote-data-ts';
import { RemoteData as RemoteDataType } from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useHistory } from 'react-router';
import { v4 as uuid } from 'uuid';

import { ApiError } from '~api/apiClient';
import { Uføregrunnlag } from '~api/revurderingApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { Nullable } from '~lib/types';
import { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { RevurderingBunnknapper } from '~pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import UtfallSomIkkeStøttes from '~pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormData, UføreperiodeFormData } from '~pages/saksbehandling/steg/uføre/types';
import { UføreperiodeForm } from '~pages/saksbehandling/steg/uføre/UføreperiodeForm';
import styles from '~pages/saksbehandling/steg/uføre/uførhet.module.less';
import { Behandling } from '~types/Behandling';

import messages from './uførhet-nb';

interface Props {
    form: UseFormReturn<FormData>;
    minDate: Nullable<Date>;
    maxDate: Nullable<Date>;
    forrigeUrl: string;
    nesteUrl: string;
    avsluttUrl: string;
    onFormSubmit: (values: FormData, onSuccess: () => void) => void;
    savingState: RemoteDataType<ApiError | undefined, Uføregrunnlag | Behandling>;
    erSaksbehandling: boolean;
}

export const UførhetForm = ({ form, onFormSubmit, savingState, ...props }: Props) => {
    const { formatMessage } = useI18n({ messages });
    const history = useHistory();

    const lagTomUføreperiode = (): UføreperiodeFormData => ({
        id: uuid(),
        fraOgMed: null,
        tilOgMed: null,
        forventetInntekt: '',
        oppfylt: null,
        begrunnelse: null,
        uføregrad: '',
    });

    const feiloppsummeringRef = React.useRef<HTMLDivElement>(null);

    const grunnlagValues = useFieldArray({
        control: form.control,
        name: 'grunnlag',
    });

    const valideringsFeil = hookFormErrorsTilFeiloppsummering(form.formState.errors);

    useEffect(() => {
        if (grunnlagValues.fields.length === 0) {
            grunnlagValues.append({
                ...lagTomUføreperiode(),
                fraOgMed: props.minDate,
                tilOgMed: props.maxDate,
            });
        }
    }, [grunnlagValues.fields]);

    return (
        <form
            onSubmit={form.handleSubmit(
                (values) => onFormSubmit(values, () => history.push(props.nesteUrl)),
                focusAfterTimeout(feiloppsummeringRef)
            )}
        >
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
            <Feiloppsummering
                tittel={formatMessage('feiloppsummering.title')}
                className={styles.feiloppsummering}
                feil={valideringsFeil}
                hidden={valideringsFeil.length === 0}
                ref={feiloppsummeringRef}
            />
            {RemoteData.isFailure(savingState) && <ApiErrorAlert error={savingState.error} />}
            {RemoteData.isSuccess(savingState) && harFeilmeldinger(savingState.value) && (
                <UtfallSomIkkeStøttes feilmeldinger={savingState.value.feilmeldinger} />
            )}
            <RevurderingBunnknapper
                tilbakeUrl={props.forrigeUrl}
                onLagreOgFortsettSenereClick={form.handleSubmit((values: FormData) =>
                    onFormSubmit(values, () => history.push(props.avsluttUrl))
                )}
                loading={RemoteData.isPending(savingState)}
            />
        </form>
    );
};

const harFeilmeldinger = (x: Uføregrunnlag | Behandling): x is Uføregrunnlag => 'feilmeldinger' in x;
