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

    const { control, watch, handleSubmit, setValue, getValues } = useForm<AttesteringFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            fritekst: '',
            beslutning: null,
            grunn: null,
            kommentar: null,
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
    const behandlingstype = props.behandligstype ?? Behandlingstype.Søknadsbehandling;

    function lastNedBrev(behandlingstype: Behandlingstype) {
        const api = (args: { sakId: string; behandlingId: string; fritekst: string; underAttestering?: boolean }) => {
            if (behandlingstype === Behandlingstype.Revurdering) {
                return PdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst({
                    revurderingId: args.behandlingId,
                    sakId: args.sakId,
                    fritekst: args.fritekst,
                    underAttestering: args.underAttestering,
                });
            } else {
                return PdfApi.fetchBrevutkastForSøknadsbehandlingWithFritekst(args);
            }
        };
        return useBrevForhåndsvisning(api);
    }

    const [seBrevStatus, lastNedBrevBehandling] = lastNedBrev(behandlingstype);
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        if (!props.behandlingsId) {
            return;
        }
        const type =
            behandlingstype === Behandlingstype.Revurdering
                ? FritekstTyper.VEDTAKSBREV_REVURDERING
                : FritekstTyper.VEDTAKSBREV_SØKNADSBEHANDLING;
        hentFritekst({
            referanseId: props.behandlingsId,
            sakId: props.sakId,
            type,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [behandlingstype, props.behandlingsId, props.sakId, setValue]);

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
                                lastNedBrevBehandling({
                                    sakId: props.sakId,
                                    behandlingId: props.behandlingsId,
                                    fritekst: getValues().fritekst,
                                    underAttestering: true,
                                });
                            }}
                        >
                            {formatMessage('knapp.vis')}
                        </Button>
                        <div className={styles.fritekstareaOuterContainer}>
                            <div className={styles.fritekstareaContainer}>
                                {RemoteData.isFailure(seBrevStatus) && (
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
                                            {RemoteData.isPending(seBrevStatus) && <Loader />}
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
                                                    const currentFritekst = getValues().fritekst ?? '';
                                                    lagreFritekst({
                                                        referanseId: props.behandlingsId,
                                                        sakId: props.sakId,
                                                        type,
                                                        fritekst: currentFritekst,
                                                    });
                                                },
                                                status: lagreFritekstStatus,
                                            }}
                                        />
                                    )}
                                    {RemoteData.isFailure(seBrevStatus) && (
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
