import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { RadioGroup, Radio, Checkbox, Textarea } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave';
import OppsummeringAvInformasjonsrevurdering from '~src/components/oppsummering/oppsummeringAvRevurdering/informasjonsrevurdering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    Valg,
} from '~src/types/Revurdering';
import { erRevurderingOpphørPgaManglendeDokumentasjon } from '~src/utils/revurdering/revurderingUtils';

import revurderingMessages from '../../revurdering-nb';

import messages from './SendTilAttestering-nb';
import styles from './SendTilAttestering.module.less';

export interface BrevvalgFormData {
    valg: Valg;
    fritekst: Nullable<string>;
    begrunnValg: boolean;
    begrunnelse: Nullable<string>;
}

export const UNDERSCORE_REGEX = /^((?!_____)[\s\S])*$/;
const brevvalgSchema = (revurdering: InformasjonsRevurdering) =>
    yup.object<BrevvalgFormData>({
        valg: yup
            .string()
            .oneOf([Valg.SEND, Valg.IKKE_SEND], 'Må velge om vedtaksbrev skal sendes ut eller ikke')
            .required(),
        fritekst: yup
            .string()
            .defined()
            .nullable()
            .matches(
                UNDERSCORE_REGEX,
                erRevurderingOpphørPgaManglendeDokumentasjon(revurdering)
                    ? 'Du må erstatte _____ med informasjon'
                    : 'Du må erstatte _____ med tall',
            ),
        begrunnValg: yup.boolean(),
        begrunnelse: yup
            .string()
            .when('begrunnValg', {
                is: true,
                then: yup.string().required().nullable(),
            })
            .defined(),
    });

const SendTilAttestering = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...revurderingMessages } });

    const [lagreBrevStatus, lagreAction] = useAsyncActionCreator(RevurderingActions.lagreBrevvalg);
    const [seBrevStatus, seBrev] = useBrevForhåndsvisning(pdfApi.fetchBrevutkastForRevurderingMedPotensieltFritekst);
    const [sendTilAttesteringStatus, sendtilAttestering] = useAsyncActionCreator(
        RevurderingActions.sendRevurderingTilAttestering,
    );

    const lagreBrev = (values: BrevvalgFormData, onSuccess: () => void) => {
        lagreAction(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                valg: values.valg,
                fritekst: values.valg === Valg.IKKE_SEND ? null : values.fritekst,
                begrunnelse: values.begrunnelse,
            },
            onSuccess,
        );
    };

    const handleLagreOgFortsettSenere = (values: BrevvalgFormData) => {
        lagreBrev(values, () => {
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        });
    };

    const handleSubmit = (values: BrevvalgFormData) => {
        lagreBrev(values, () => {
            sendtilAttestering(
                {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                },
                () =>
                    Routes.navigateToSakIntroWithMessage(
                        navigate,
                        formatMessage('notification.sendtTilAttestering'),
                        props.sakId,
                    ),
            );
        });
    };

    const form = useForm<BrevvalgFormData>({
        defaultValues: {
            valg: props.revurdering.brevvalg.valg,
            fritekst: props.revurdering.brevvalg.fritekst
                ? props.revurdering.brevvalg.fritekst
                : erRevurderingOpphørPgaManglendeDokumentasjon(props.revurdering)
                  ? formatMessage('opplysningsplikt.forhåndstekst')
                  : null,
            begrunnValg:
                props.revurdering.brevvalg.begrunnelse && props.revurdering.brevvalg.begrunnelse.length > 0
                    ? true
                    : false,
            begrunnelse: props.revurdering.brevvalg.begrunnelse,
        },
        resolver: yupResolver(brevvalgSchema(props.revurdering)),
    });

    const watch = form.watch();

    useEffect(() => {
        if (
            watch.valg === Valg.SEND &&
            watch.fritekst !== null &&
            watch.fritekst !== props.revurdering.brevvalg.fritekst
        ) {
            lagreBrev(watch, () => void 0);
        }
    }, [watch.valg]);

    return (
        <ToKolonner tittel={'Vedtaksbrev'} width="40/60">
            {{
                left: (
                    <FormWrapper
                        className={styles.formContainer}
                        form={form}
                        neste={{
                            savingState: sendTilAttesteringStatus,
                            onClick: handleSubmit,
                            tekst: formatMessage('sendTilAttestering.button.label'),
                        }}
                        tilbake={{
                            url: Routes.revurderingSeksjonSteg.createURL({
                                sakId: props.sakId,
                                revurderingId: props.revurdering.id,
                                seksjon: RevurderingSeksjoner.Oppsummering,
                                steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
                            }),
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleLagreOgFortsettSenere,
                            loading: RemoteData.isPending(lagreBrevStatus),
                            url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                        }}
                    >
                        <div>
                            <Controller
                                control={form.control}
                                name="valg"
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        legend={formatMessage('brevvalg.skal.det.sendes.brev')}
                                        error={fieldState.error?.message}
                                        {...field}
                                        value={field.value ?? Valg.SEND}
                                    >
                                        <Radio value={Valg.SEND}>{formatMessage('ja')}</Radio>
                                        <Radio value={Valg.IKKE_SEND}>{formatMessage('nei')}</Radio>
                                    </RadioGroup>
                                )}
                            />

                            <div className={styles.textareaContainer}>
                                {watch.valg === Valg.SEND && (
                                    <TextareaWithAutosave
                                        textarea={{
                                            name: 'fritekst',
                                            label: formatMessage('brevtekst'),
                                            control: form.control,
                                            value: form.watch('fritekst') ?? '',
                                            description: [formatMessage('knapp.brev.fritekst.description')],
                                        }}
                                        save={{
                                            handleSave: () => {
                                                if (watch.valg === Valg.SEND) {
                                                    lagreAction({
                                                        sakId: props.sakId,
                                                        revurderingId: props.revurdering.id,
                                                        ...form.getValues(),
                                                    });
                                                }
                                            },
                                            status: lagreBrevStatus,
                                        }}
                                        brev={{
                                            handleSeBrev: () =>
                                                seBrev({
                                                    sakId: props.sakId,
                                                    revurderingId: props.revurdering.id,
                                                }),
                                            status: seBrevStatus,
                                        }}
                                    />
                                )}
                                <Controller
                                    control={form.control}
                                    name={'begrunnValg'}
                                    render={({ field }) => (
                                        <Checkbox
                                            name={field.name}
                                            checked={field.value}
                                            onChange={() => {
                                                form.setValue('begrunnValg', !field.value);
                                                form.setValue('begrunnelse', null);
                                            }}
                                        >
                                            {formatMessage('begrunnelse.vil.begrunne')}
                                        </Checkbox>
                                    )}
                                />
                                {watch.begrunnValg && (
                                    <Controller
                                        control={form.control}
                                        name={'begrunnelse'}
                                        render={({ field, fieldState }) => (
                                            <Textarea
                                                {...field}
                                                label={formatMessage('begrunnelse')}
                                                value={field.value ?? ''}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            </div>

                            {RemoteData.isFailure(lagreBrevStatus) && <ApiErrorAlert error={lagreBrevStatus.error} />}
                            {RemoteData.isFailure(sendTilAttesteringStatus) && (
                                <ApiErrorAlert error={sendTilAttesteringStatus.error} />
                            )}
                        </div>
                    </FormWrapper>
                ),
                right: (
                    <OppsummeringAvInformasjonsrevurdering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={props.gjeldendeGrunnlagOgVilkår}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default SendTilAttestering;
