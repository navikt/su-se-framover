import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useEffect, useMemo } from 'react';
import { Control, Controller, UseFormWatch, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { hentDokumenter } from '~src/api/dokumentApi';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput';
import { avsluttRevurdering } from '~src/features/revurdering/revurderingActions';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { Revurdering } from '~src/types/Revurdering';

import AvsluttBehandlingBunnknapper from '../avsluttBehandlingBunnknapper/AvsluttBehandlingBunnknapper';
import styles from './avsluttRevurdering.module.less';
import messages from './avsluttRevurdering-nb';
import { AvsluttRevurderingFormData, avsluttRevurderingSchema, Brevvalg } from './avsluttRevurderingUtils';

const AvsluttRevurdering = (props: { sakId: string; revurdering: Revurdering }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });

    const [avsluttRevurderingStatus, avsluttRevurderingAction] = useAsyncActionCreator(avsluttRevurdering);

    const [hentStatus, hent] = useApiCall(hentDokumenter);

    useEffect(() => {
        hent({ id: props.revurdering.id, idType: DokumentIdType.Revurdering });
    }, []);

    const erForhåndsvarslet = useMemo(() => {
        return RemoteData.isSuccess(hentStatus) && hentStatus.value.length > 0;
    }, [hentStatus]);

    const { control, watch, handleSubmit } = useForm<AvsluttRevurderingFormData>({
        defaultValues: { fritekst: null, begrunnelse: null },
        resolver: yupResolver(avsluttRevurderingSchema(erForhåndsvarslet)),
    });

    const avsluttRevurderingSubmitHandler = (data: AvsluttRevurderingFormData) => {
        avsluttRevurderingAction(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                begrunnelse: data.begrunnelse!,
                fritekst:
                    data.brevvalgForForhåndsvarsel === Brevvalg.SKAL_SENDE_BREV_MED_FRITEKST ? data.fritekst : null,
                brevvalg: data.brevvalgForForhåndsvarsel,
            },
            () => {
                const message = formatMessage('avslutt.revurderingHarBlittAvsluttet');
                return Routes.navigateToSakIntroWithMessage(navigate, message, props.sakId);
            },
        );
    };

    return (
        <form onSubmit={handleSubmit(avsluttRevurderingSubmitHandler)}>
            {erForhåndsvarslet && (
                <ForhåndsvarsletRevurderingForm
                    sakId={props.sakId}
                    revurderingId={props.revurdering.id}
                    formController={control}
                    watch={watch}
                />
            )}
            <div className={styles.begrunnelseContainer}>
                <Controller
                    control={control}
                    name={'begrunnelse'}
                    render={({ field, fieldState }) => (
                        <Textarea
                            label={formatMessage('form.begrunnelse.label')}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            </div>

            {RemoteData.isFailure(avsluttRevurderingStatus) && <ApiErrorAlert error={avsluttRevurderingStatus.error} />}

            <AvsluttBehandlingBunnknapper
                sakId={props.sakId}
                submitButtonText={formatMessage('knapp.avsluttRevurdering')}
                isSubmitPending={RemoteData.isPending(avsluttRevurderingStatus)}
            />
        </form>
    );
};

const ForhåndsvarsletRevurderingForm = (props: {
    sakId: string;
    revurderingId: string;
    formController: Control<AvsluttRevurderingFormData>;
    watch: UseFormWatch<AvsluttRevurderingFormData>;
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div className={styles.revurderingForhåndsvarsletContainer}>
            <Alert variant="info">{formatMessage('alert.revurderingErForhåndsvarslet')}</Alert>
            <Controller
                control={props.formController}
                name={'brevvalgForForhåndsvarsel'}
                render={({ field, fieldState }) => (
                    <RadioGroup
                        {...field}
                        legend={formatMessage('form.brev.skalSendeBrev')}
                        value={field.value ?? ''}
                        error={fieldState.error?.message}
                    >
                        {Object.values(Brevvalg).map((valg) => (
                            <Radio key={valg} value={valg}>
                                {formatMessage(valg)}
                            </Radio>
                        ))}
                    </RadioGroup>
                )}
            />
            {props.watch('brevvalgForForhåndsvarsel') === Brevvalg.SKAL_SENDE_BREV_MED_FRITEKST && (
                <Controller
                    control={props.formController}
                    name={'fritekst'}
                    render={({ field, fieldState }) => (
                        <BrevInput
                            tekst={field.value}
                            onVisBrevClick={() =>
                                pdfApi.fetchBrevutkastForAvslutningAvRevurdering({
                                    sakId: props.sakId,
                                    revurderingId: props.revurderingId,
                                    fritekst: props.watch('fritekst') || '',
                                })
                            }
                            onChange={field.onChange}
                            feil={fieldState.error}
                        />
                    )}
                />
            )}
        </div>
    );
};

export default AvsluttRevurdering;
