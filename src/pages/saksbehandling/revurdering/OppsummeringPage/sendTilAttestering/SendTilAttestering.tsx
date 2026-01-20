import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FritekstTyper, hentFritekst, redigerFritekst } from '~src/api/fritekstApi.ts';
import * as pdfApi from '~src/api/pdfApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosave from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosave';
import OppsummeringAvInformasjonsrevurdering from '~src/components/oppsummering/oppsummeringAvRevurdering/informasjonsrevurdering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useApiCall, useAsyncActionCreator, useBrevForhåndsvisning } from '~src/lib/hooks';
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
import { Sakstype } from '~src/types/Sak.ts';
import { erRevurderingOpphørPgaManglendeDokumentasjon } from '~src/utils/revurdering/revurderingUtils';
import revurderingMessages from '../../revurdering-nb';
import styles from './SendTilAttestering.module.less';
import messages from './SendTilAttestering-nb';

export interface BrevvalgFormData {
    valg: Valg;
    fritekst: Nullable<string>;
    begrunnelse: Nullable<string>;
}

const UNDERSCORE_REGEX = /^((?!_____)[\s\S])*$/;
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
            )
            .when('valg', {
                is: Valg.SEND,
                then: yup.string().required(),
                otherwise: yup.string().nullable().notRequired(),
            }),
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
    sakstype: Sakstype;
    revurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...messages, ...revurderingMessages } });

    const [lagreBrevStatus, lagreAction] = useAsyncActionCreator(RevurderingActions.lagreBrevvalg);
    const [lagreFritekstStatus, lagreFritekst] = useApiCall(redigerFritekst);

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
            begrunnelse: props.revurdering.brevvalg.begrunnelse,
        },
        resolver: yupResolver(brevvalgSchema(props.revurdering)),
    });

    const watch = form.watch();

    useEffect(() => {
        if (watch.valg !== Valg.SEND) return;

        const referanseId = props.revurdering.id;
        if (!referanseId) return;

        hentFritekst({
            referanseId,
            sakId: props.sakId,
            type: FritekstTyper.VEDTAKSBREV_REVURDERING,
        }).then((result) => {
            if (result.status === 'ok' && result.data) {
                form.setValue('fritekst', result.data.fritekst ?? '');
            }
        });
    }, [watch.valg, props.revurdering.id, props.sakId]);

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
                                                    lagreFritekst({
                                                        referanseId: props.revurdering.id,
                                                        sakId: props.sakId,
                                                        type: FritekstTyper.VEDTAKSBREV_REVURDERING,
                                                        fritekst: form.watch('fritekst') ?? '',
                                                    });
                                                }
                                            },
                                            status: lagreFritekstStatus,
                                        }}
                                        brev={{
                                            handleSeBrev: () =>
                                                seBrev({
                                                    sakId: props.sakId,
                                                    revurderingId: props.revurdering.id,
                                                    fritekst: form.getValues().fritekst ?? '',
                                                    underAttestering: false,
                                                }),
                                            status: seBrevStatus,
                                        }}
                                    />
                                )}
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
                        sakstype={props.sakstype}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default SendTilAttestering;
