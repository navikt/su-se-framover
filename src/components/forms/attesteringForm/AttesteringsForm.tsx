import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Radio, RadioGroup, Alert, Loader, Textarea } from '@navikt/ds-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as PdfApi from '~src/api/pdfApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { ApiResult, useApiCall, useBrevForhåndsvisning } from '~src/lib/hooks';
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
    fritekst: Nullable<string>;
}

enum Beslutning {
    IVERKSETT = 'iverksett',
    UNDERKJENN = 'underkjenn',
}

const schema = yup.object<AttesteringFormData>({
    fritekst: yup.string().nullable().required(),
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
    fritekst: string;
    behandlingsId: string;
    redigerbartBrev: boolean;
    sakId: string;
    iverksett: {
        fn: (fritekstTiBrev: Nullable<string>) => void;
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

    const { control, getValues, watch, handleSubmit } = useForm<AttesteringFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            beslutning: null,
            fritekst: props.fritekst,
        },
    });

    const submitHandler = (data: AttesteringFormData) => {
        switch (data.beslutning) {
            case Beslutning.IVERKSETT:
                props.iverksett.fn(data.fritekst);
                break;
            case Beslutning.UNDERKJENN:
                props.underkjenn.fn(data.grunn!, data.kommentar ?? '');
        }
    };

    const [hentBrevutkastStatus] = useApiCall(PdfApi.fetchBrevutkastForSøknadsbehandling);
    const [brevStatus, lastNedBrev] = useBrevForhåndsvisning(PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst);
    const [showInput, setShowInput] = useState(false);

    return (
        <div className={styles.redigerContainer}>
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
            {props.redigerbartBrev && (
                <Oppsummeringspanel
                    ikon={Oppsummeringsikon.Task}
                    farge={Oppsummeringsfarge.Lilla}
                    tittel={'Rediger Brev'}
                >
                    <div className={styles.brevContainer}>
                        <Button
                            variant="secondary"
                            type="button"
                            className={styles.knapper}
                            onClick={() =>
                                lastNedBrev({
                                    sakId: props.sakId,
                                    behandlingId: props.behandlingsId,
                                    fritekst: getValues('fritekst')!,
                                })
                            }
                            loading={RemoteData.isPending(hentBrevutkastStatus)}
                        >
                            {formatMessage('knapp.vis')}
                        </Button>
                        {RemoteData.isFailure(hentBrevutkastStatus) && (
                            <ApiErrorAlert error={hentBrevutkastStatus.error} />
                        )}
                        <div className={styles.fritekstareaOuterContainer}>
                            <div className={styles.fritekstareaContainer}>
                                {RemoteData.isFailure(brevStatus) && (
                                    <Alert variant="error">{formatMessage('feilmelding.brevhentingFeilet')}</Alert>
                                )}{' '}
                                <div>
                                    {!showInput ? (
                                        <Button
                                            variant="secondary"
                                            className={styles.knapper}
                                            type="button"
                                            onClick={() => {
                                                setShowInput(true);
                                            }}
                                        >
                                            {formatMessage('knapp.rediger')}
                                            {RemoteData.isPending(brevStatus) && <Loader />}
                                        </Button>
                                    ) : (
                                        <Controller
                                            control={control}
                                            name="fritekst"
                                            render={({ field }) => (
                                                <Textarea
                                                    className={styles.fritekst}
                                                    label={formatMessage('input.fritekst.label')}
                                                    value={field.value ?? ''}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                />
                                            )}
                                        />
                                    )}
                                    {RemoteData.isFailure(brevStatus) && (
                                        <Alert variant="error">{formatMessage('feilmelding.brevhentingFeilet')}</Alert>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Oppsummeringspanel>
            )}
        </div>
    );
};

export default AttesteringsForm;
