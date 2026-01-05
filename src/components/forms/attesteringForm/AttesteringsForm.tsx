import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Loader, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi.ts';
import * as PdfApi from '~src/api/pdfApi.ts';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave.tsx';
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
import styles from './attesteringsForm.module.less';
import messages from './attesteringsForm-nb';
import UnderkjennelsesForm from './UnderkjennelsesForm';

export interface AttesteringFormData {
    beslutning: Nullable<Beslutning>;
    grunn: Nullable<UnderkjennelseGrunn>;
    kommentar: Nullable<string>;
    fritekst: string;
}

enum Beslutning {
    IVERKSETT = 'iverksett',
    UNDERKJENN = 'underkjenn',
}

const schema = yup.object<AttesteringFormData>({
    fritekst: yup.mixed<string>(),
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
    behandlingsId: string;
    redigerbartBrev: boolean;
    sakId: string;
    behandligstype?: Behandlingstype;
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

    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);

    const submitHandler = (data: AttesteringFormData) => {
        switch (data.beslutning) {
            case Beslutning.IVERKSETT:
                props.iverksett.fn();
                break;
            case Beslutning.UNDERKJENN:
                props.underkjenn.fn(data.grunn!, data.kommentar ?? '');
        }
    };
    const [brevStatusSøknad, lastNedBrevSøknad] = useBrevForhåndsvisning(
        PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst,
    );
    const [, lastNedBrevRevurdering] = useBrevForhåndsvisning(
        PdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst,
    );
    const [showInput, setShowInput] = useState(false);

    const initialValues: AttesteringFormData = {
        fritekst: '',
        beslutning: null,
        grunn: null,
        kommentar: null,
    };

    const behandlingstype = props.behandligstype ?? Behandlingstype.Søknadsbehandling;

    const form = useForm<AttesteringFormData>({
        defaultValues: initialValues,
    });
    useEffect(() => {
        if (!props.behandlingsId) {
            return;
        }
        hentFritekst({
            referanseId: props.behandlingsId,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                form.setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [props.behandlingsId, props.sakId, form]);

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
                            onClick={() => {
                                if (behandlingstype === Behandlingstype.Revurdering) {
                                    lastNedBrevRevurdering({
                                        sakId: props.sakId,
                                        revurderingId: props.behandlingsId,
                                    });
                                } else {
                                    lastNedBrevSøknad({
                                        sakId: props.sakId,
                                        behandlingId: props.behandlingsId,
                                        fritekst: form.getValues().fritekst,
                                        underAttestering: true,
                                    });
                                }
                            }}
                        >
                            {formatMessage('knapp.vis')}
                        </Button>
                        <div className={styles.fritekstareaOuterContainer}>
                            <div className={styles.fritekstareaContainer}>
                                {RemoteData.isFailure(brevStatusSøknad) && (
                                    <Alert variant="error">{formatMessage('feilmelding.brevhentingFeilet')}</Alert>
                                )}
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
                                            {RemoteData.isPending(brevStatusSøknad) && <Loader />}
                                        </Button>
                                    ) : (
                                        <TextareaWithAutosave
                                            textarea={{
                                                name: 'fritekst',
                                                label: formatMessage('input.fritekst.label'),
                                                control,
                                                value: watch('fritekst') ?? '',
                                            }}
                                            save={{
                                                handleSave: () => {
                                                    const type =
                                                        behandlingstype === Behandlingstype.Revurdering
                                                            ? FritekstTyper.VEDTAKSBREV_REVURDERING
                                                            : FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING;
                                                    lagreFritekst({
                                                        referanseId: props.behandlingsId,
                                                        sakId: props.sakId,
                                                        type,
                                                        fritekst: watch('fritekst') ?? '',
                                                    });
                                                },
                                                status: lagreFritekstStatus,
                                            }}
                                        />
                                    )}
                                    {RemoteData.isFailure(brevStatusSøknad) && (
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
