import { Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Control, Controller } from 'react-hook-form';

import { useI18n } from '~lib/i18n';
import { UnderkjennelseGrunn, underkjennelsesGrunnTextMapper } from '~types/Behandling';

import { AttesterKlageFormData } from './Attestering';
import messages from './attestering-nb';
import styles from './attestering.module.less';

const UnderkjennelsesForm = (props: { control: Control<AttesterKlageFormData> }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.underkjennelsesFormContainer}>
            <Controller
                control={props.control}
                name={'grunn'}
                render={({ field, fieldState }) => (
                    <Select
                        {...field}
                        className={styles.grunnContainer}
                        label={formatMessage('underkjennelse.select.label')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        <option value="">{formatMessage('underkjennelse.select.defaultValue')}</option>
                        {Object.values(UnderkjennelseGrunn).map((grunn) => (
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
                        placeholder={formatMessage('underkjennelse.kommentar.placeholder')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
};

export default UnderkjennelsesForm;
