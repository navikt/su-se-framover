import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Select, Textarea } from '@navikt/ds-react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { getDateErrorMessage } from '~src/lib/validering';
import { Gjenopptak, OpprettetRevurderingGrunn, StansAvYtelse } from '~src/types/Revurdering';

import ApiErrorAlert from '../../apiErrorAlert/ApiErrorAlert';
import { MonthPicker } from '../../inputs/datePicker/DatePicker';

import messages from './StansGjenopptaForm-nb';
import styles from './StansGjenopptaForm.module.less';
import { StansGjenopptaFormData, isStans } from './StansGjenopptaFormUtils';

interface Props<T extends StansGjenopptaFormData = StansGjenopptaFormData> {
    form: UseFormReturn<T>;
    tilbakeUrl: string;
    apiStatus: ApiResult<Gjenopptak> | ApiResult<StansAvYtelse>;
    handleSubmit: (values: StansGjenopptaFormData) => Promise<void>;
}

const StansGjenopptaForm = (props: Props) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    return (
        <form
            className={styles.formContainer}
            onSubmit={props.form.handleSubmit((values) => props.handleSubmit(values))}
        >
            <div className={styles.formInputsContainer}>
                <Controller
                    control={props.form.control}
                    name="årsak"
                    render={({ field, fieldState }) => (
                        <Select
                            error={fieldState.error?.message}
                            value={field.value ?? undefined}
                            onChange={field.onChange}
                            label={formatMessage('årsak.label')}
                        >
                            <option>{formatMessage('årsak.defaultValue')}</option>
                            {isStans(props.form.getValues()) && (
                                <option value={OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING}>
                                    {formatMessage(OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING)}
                                </option>
                            )}
                            {!isStans(props.form.getValues()) && (
                                <option value={OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING}>
                                    {formatMessage(OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING)}
                                </option>
                            )}
                            {!isStans(props.form.getValues()) && (
                                <option value={OpprettetRevurderingGrunn.STANSET_VED_EN_FEIL}>
                                    {formatMessage(OpprettetRevurderingGrunn.STANSET_VED_EN_FEIL)}
                                </option>
                            )}
                        </Select>
                    )}
                />
                {isStans(props.form.getValues()) && (
                    <Controller
                        control={props.form.control}
                        name="stansDato"
                        render={({ field, fieldState }) => (
                            <MonthPicker
                                label={formatMessage('stans.fraOgMed')}
                                value={field.value}
                                onChange={(date: Date | null) => field.onChange(date)}
                                error={getDateErrorMessage(fieldState.error)}
                            />
                        )}
                    />
                )}
                <Controller
                    control={props.form.control}
                    name="begrunnelse"
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('begrunnelse.label')}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            {RemoteData.isFailure(props.apiStatus) && <ApiErrorAlert error={props.apiStatus.error} />}
            <div className={styles.knapperContainer}>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                        navigate(props.tilbakeUrl);
                    }}
                >
                    {formatMessage('knapp.tilbake')}
                </Button>
                <Button loading={RemoteData.isPending(props.apiStatus)}>{formatMessage('knapp.neste')}</Button>
            </div>
        </form>
    );
};

export default StansGjenopptaForm;
