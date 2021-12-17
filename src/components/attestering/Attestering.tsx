import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Loader, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { ApiResult } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { UnderkjennelseGrunn } from '~types/Behandling';

import messages from './attestering-nb';
import styles from './attestering.module.less';
import UnderkjennelsesForm from './UnderkjennelsesForm';

export interface AttesterKlageFormData {
    beslutning: Nullable<Beslutning>;
    grunn: Nullable<UnderkjennelseGrunn>;
    kommentar: Nullable<string>;
}

enum Beslutning {
    IVERKSETT = 'iverksett',
    UNDERKJENN = 'underkjenn',
}

const schema = yup.object<AttesterKlageFormData>({
    beslutning: yup.string().nullable().required().oneOf([Beslutning.IVERKSETT, Beslutning.UNDERKJENN]),
    grunn: yup.string<UnderkjennelseGrunn>().when('beslutning', {
        is: Beslutning.UNDERKJENN,
        then: yup.string().required().oneOf(Object.values(UnderkjennelseGrunn), 'Du må velge en grunn'),
    }),
    kommentar: yup.mixed<string>().when('beslutning', {
        is: Beslutning.UNDERKJENN,
        then: yup.string().required(),
    }),
});

interface Props {
    sakId: string;
    iverksett: {
        fn: () => void;
        status: ApiResult<unknown>;
    };
    underkjenn: {
        fn: (grunn: UnderkjennelseGrunn, kommentar: string) => void;
        status: ApiResult<unknown>;
    };
}

const Attestering: React.FC<Props> = ({ children, ...props }) => {
    const { formatMessage } = useI18n({ messages });

    const { control, watch, handleSubmit } = useForm<AttesterKlageFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            beslutning: null,
        },
    });

    return (
        <form
            className={styles.container}
            onSubmit={handleSubmit((val) => {
                if (val.beslutning === Beslutning.IVERKSETT) props.iverksett.fn();
                if (val.beslutning === Beslutning.UNDERKJENN) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    props.underkjenn.fn(val.grunn!, val.kommentar ?? '');
                }
            })}
        >
            <div>
                {children}
                <Controller
                    control={control}
                    name={'beslutning'}
                    render={({ field, fieldState }) => (
                        <RadioGroup
                            {...field}
                            legend={formatMessage('beslutning.label')}
                            error={fieldState.error?.message}
                            value={field.value ?? ''}
                        >
                            <Radio value={Beslutning.IVERKSETT}>{formatMessage('beslutning.iverksett')}</Radio>
                            <Radio value={Beslutning.UNDERKJENN}>{formatMessage('beslutning.underkjenn')}</Radio>
                        </RadioGroup>
                    )}
                />
                {watch('beslutning') === Beslutning.UNDERKJENN && <UnderkjennelsesForm control={control} />}
                <div className={styles.knapperContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button>
                        {formatMessage('knapp.bekreft')}
                        {(RemoteData.isPending(props.iverksett.status) ||
                            RemoteData.isPending(props.underkjenn.status)) && <Loader />}
                    </Button>
                </div>
                <div className={styles.apiErrorContainer}>
                    {RemoteData.isFailure(props.iverksett.status) && (
                        <ApiErrorAlert error={props.iverksett.status.error} />
                    )}
                    {RemoteData.isFailure(props.underkjenn.status) && (
                        <ApiErrorAlert error={props.underkjenn.status.error} />
                    )}
                </div>
            </div>
        </form>
    );
};

export default Attestering;
