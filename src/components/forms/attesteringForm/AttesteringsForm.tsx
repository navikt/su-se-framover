import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Radio, RadioGroup } from '@navikt/ds-react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { ApiResult } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { UnderkjennelseGrunn, UnderkjennelseGrunnBehandling } from '~src/types/Behandling';
import { UnderkjennelseGrunnTilbakekreving } from '~src/types/ManuellTilbakekrevingsbehandling';

import messages from './attesteringsForm-nb';
import styles from './attesteringsForm.module.less';
import UnderkjennelsesForm from './UnderkjennelsesForm';

export interface AttesteringFormData {
    beslutning: Nullable<Beslutning>;
    grunn: Nullable<UnderkjennelseGrunn>;
    kommentar: Nullable<string>;
}

enum Beslutning {
    IVERKSETT = 'iverksett',
    UNDERKJENN = 'underkjenn',
}

const schema = yup.object<AttesteringFormData>({
    beslutning: yup.string().nullable().required().oneOf([Beslutning.IVERKSETT, Beslutning.UNDERKJENN]),
    grunn: yup.string<UnderkjennelseGrunn>().when('beslutning', {
        is: Beslutning.UNDERKJENN,
        then: yup
            .string()
            .required()
            .oneOf(
                [...Object.values(UnderkjennelseGrunnBehandling), ...Object.values(UnderkjennelseGrunnTilbakekreving)],
                'Du må velge en grunn',
            ),
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
        underkjennelsesgrunner: UnderkjennelseGrunn[];
    };
    radioTexts?: {
        bekreftText?: string;
        underkjennText?: string;
    };
}

export const AttesteringsForm = (props: Props) => {
    const { formatMessage } = useI18n({ messages });

    const { control, watch, handleSubmit } = useForm<AttesteringFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            beslutning: null,
        },
    });

    const submitHandler = (data: AttesteringFormData) => {
        switch (data.beslutning) {
            case Beslutning.IVERKSETT:
                props.iverksett.fn();
                break;
            case Beslutning.UNDERKJENN:
                props.underkjenn.fn(data.grunn!, data.kommentar ?? '');
        }
    };

    return (
        <Oppsummeringspanel ikon={Oppsummeringsikon.Blyant} farge={Oppsummeringsfarge.Blå} tittel={'Beslutning'}>
            <form className={styles.container} onSubmit={handleSubmit(submitHandler)}>
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
                            <Radio value={Beslutning.IVERKSETT}>
                                {props.radioTexts?.bekreftText ?? formatMessage('beslutning.iverksett')}
                            </Radio>
                            <Radio value={Beslutning.UNDERKJENN}>
                                {props.radioTexts?.underkjennText ?? formatMessage('beslutning.underkjenn')}
                            </Radio>
                        </RadioGroup>
                    )}
                />
                {watch('beslutning') === Beslutning.UNDERKJENN && (
                    <UnderkjennelsesForm
                        control={control}
                        underkjennelsesgrunn={props.underkjenn.underkjennelsesgrunner}
                    />
                )}
                <div className={styles.knapperContainer}>
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                    >
                        {formatMessage('knapp.tilbake')}
                    </LinkAsButton>
                    <Button
                        loading={
                            RemoteData.isPending(props.iverksett.status) ||
                            RemoteData.isPending(props.underkjenn.status)
                        }
                    >
                        {formatMessage('knapp.bekreft')}
                    </Button>
                </div>
                <div>
                    {RemoteData.isFailure(props.iverksett.status) && (
                        <ApiErrorAlert error={props.iverksett.status.error} />
                    )}
                    {RemoteData.isFailure(props.underkjenn.status) && (
                        <ApiErrorAlert error={props.underkjenn.status.error} />
                    )}
                </div>
            </form>
        </Oppsummeringspanel>
    );
};

export default AttesteringsForm;
