import { Select, Textarea } from '@navikt/ds-react';
import { Control, Controller } from 'react-hook-form';

import { useI18n } from '~src/lib/i18n';
import { underkjennelsesGrunnTextMapper } from '~src/typeMappinger/UnderkjennelseGrunn';
import { UnderkjennelseGrunn } from '~src/types/Behandling';

import { AttesteringFormData } from './AttesteringsForm';
import styles from './attesteringsForm.module.less';
import messages from './attesteringsForm-nb';

const UnderkjennelsesForm = (props: {
    underkjennelsesgrunn: UnderkjennelseGrunn[];
    control: Control<AttesteringFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.underkjennelsesFormContainer}>
            <Controller
                control={props.control}
                name={'grunn'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        label={formatMessage('underkjennelse.select.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        <option value="">{formatMessage('underkjennelse.select.defaultValue')}</option>
                        {props.underkjennelsesgrunn.map((grunn) => (
                            <option value={grunn} key={grunn}>
                                {underkjennelsesGrunnTextMapper[grunn]}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <Controller
                control={props.control}
                name={'kommentar'}
                render={({ field, fieldState }) => (
                    <Textarea
                        {...field}
                        label={formatMessage('underkjennelse.kommentar.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                        description={formatMessage('underkjennelse.kommentar.description')}
                    />
                )}
            />
        </div>
    );
};

export default UnderkjennelsesForm;
