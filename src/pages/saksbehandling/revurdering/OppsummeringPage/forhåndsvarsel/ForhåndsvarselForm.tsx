import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Loader, Radio, RadioGroup } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Brevtype, hentMottaker } from '~src/api/mottakerClient.ts';
import * as PdfApi from '~src/api/pdfApi';
import { BrevInput } from '~src/components/inputs/brevInput/BrevInput';
import { MottakerAlert, toMottakerAlert } from '~src/components/mottaker/mottakerUtils';
import OppsummeringAvInformasjonsrevurdering from '~src/components/oppsummering/oppsummeringAvRevurdering/informasjonsrevurdering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { VisDokumenter } from '~src/pages/saksbehandling/dokumenter/DokumenterPage';
import { MottakerForm } from '~src/pages/saksbehandling/mottaker/Mottaker.tsx';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { DokumentIdType } from '~src/types/dokument/Dokument';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { InformasjonsRevurdering, RevurderingOppsummeringSteg, RevurderingSeksjoner } from '~src/types/Revurdering';
import { Sakstype } from '~src/types/Sak.ts';
import styles from './ForhåndsvarselForm.module.less';
import messages from './ForhåndsvarselForm-nb';

interface ForhåndsvarselFormData {
    oppretterNyttForhåndsvarsel: boolean;
    fritekst: Nullable<string>;
}

const schema = yup.object<ForhåndsvarselFormData>({
    oppretterNyttForhåndsvarsel: yup.boolean(),
    fritekst: yup
        .string()
        .when('oppretterNyttForhåndsvarsel', {
            is: true,
            then: yup.string().required().nullable(),
            otherwise: yup.string().nullable().defined(),
        })
        .defined(),
});

const ForhåndsvarselForm = (props: {
    sakId: string;
    sakstype: Sakstype;
    revurdering: InformasjonsRevurdering;
    forrigeUrl: string;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [skalLeggeTilMottaker, setSkalLeggeTilMottaker] = useState(false);
    const [mottakerFinnes, setMottakerFinnes] = useState<boolean | null>(null);
    const [mottakerFetchError, setMottakerFetchError] = useState<MottakerAlert | null>(null);
    const mottakerBrevtype: Brevtype = 'FORHANDSVARSEL';

    const form = useForm<ForhåndsvarselFormData>({
        defaultValues: { oppretterNyttForhåndsvarsel: false, fritekst: null },
        resolver: yupResolver(schema),
    });
    const watch = form.watch();
    const oppretterNyttForhåndsvarsel = form.watch('oppretterNyttForhåndsvarsel');

    useEffect(() => {
        form.clearErrors('fritekst');
        if (!oppretterNyttForhåndsvarsel) {
            setSkalLeggeTilMottaker(false);
        }
    }, [oppretterNyttForhåndsvarsel]);

    useEffect(() => {
        if (!props.revurdering.id || !oppretterNyttForhåndsvarsel) {
            return;
        }

        const sjekkMottaker = async () => {
            setMottakerFinnes(null);
            setMottakerFetchError(null);

            const setMottakerFunnet = () => {
                setMottakerFinnes(true);
                setSkalLeggeTilMottaker(true);
                setMottakerFetchError(null);
            };

            const setMottakerIkkeFunnet = () => {
                setMottakerFinnes(false);
                setSkalLeggeTilMottaker(false);
                setMottakerFetchError(null);
            };

            const res = await hentMottaker(props.sakId, 'REVURDERING', props.revurdering.id, mottakerBrevtype);

            if (res.status === 'ok') {
                if (res.data) {
                    setMottakerFunnet();
                } else {
                    setMottakerIkkeFunnet();
                }
                return;
            }

            if (res.error.statusCode === 404) {
                setMottakerIkkeFunnet();
                return;
            }

            setMottakerFinnes(false);
            setSkalLeggeTilMottaker(false);
            setMottakerFetchError(
                toMottakerAlert(res.error, formatMessage('forhåndsvarsel.feilmelding.kanIkkeHenteMottaker')),
            );
        };
        sjekkMottaker();
    }, [oppretterNyttForhåndsvarsel, props.revurdering.id, props.sakId]);

    const [lagreForhåndsvarselStatus, lagreForhåndsvarsel] = useAsyncActionCreator(
        RevurderingActions.lagreForhåndsvarsel,
    );

    const nesteUrl = Routes.revurderingSeksjonSteg.createURL({
        sakId: props.sakId,
        revurderingId: props.revurdering.id,
        seksjon: RevurderingSeksjoner.Oppsummering,
        steg: RevurderingOppsummeringSteg.SendTilAttestering,
    });

    const handleSubmit = (values: ForhåndsvarselFormData) => {
        if (!values.oppretterNyttForhåndsvarsel) {
            navigate(nesteUrl);
        } else {
            lagreForhåndsvarsel(
                {
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    fritekstTilBrev: values.fritekst!,
                },
                () =>
                    Routes.navigateToSakIntroWithMessage(navigate, formatMessage('forhåndsvarsel.sendt'), props.sakId),
            );
        }
    };

    return (
        <ToKolonner tittel={formatMessage('forhåndsvarsel.tittel')} width="40/60">
            {{
                left: (
                    <FormWrapper
                        className={styles.formContainer}
                        form={form}
                        neste={{
                            savingState: lagreForhåndsvarselStatus,
                            onClick: handleSubmit,
                            url: nesteUrl,
                            tekst: watch.oppretterNyttForhåndsvarsel
                                ? formatMessage('forhåndsvarsel.neste.sendOgNaviger')
                                : undefined,
                        }}
                        tilbake={{ url: props.forrigeUrl }}
                        fortsettSenere={{
                            onClick: () => navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                            tekst: formatMessage('forhåndsvarsel.fortsettSenere'),
                        }}
                    >
                        <div>
                            <Controller
                                name={'oppretterNyttForhåndsvarsel'}
                                control={form.control}
                                render={({ field }) => (
                                    <RadioGroup legend={formatMessage('forhåndsvarsel.skalSendes')} {...field}>
                                        <Radio value={true}>{formatMessage('forhåndsvarsel.skalSende.ja')}</Radio>
                                        <Radio value={false}>{formatMessage('forhåndsvarsel.skalSende.nei')}</Radio>
                                    </RadioGroup>
                                )}
                            />

                            {watch.oppretterNyttForhåndsvarsel && (
                                <Controller
                                    name={'fritekst'}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <BrevInput
                                            tittel={formatMessage('forhåndsvarsel.fritekst.label')}
                                            onVisBrevClick={() =>
                                                PdfApi.fetchBrevutkastForForhåndsvarsel(
                                                    props.sakId,
                                                    props.revurdering.id,
                                                    field.value ?? '',
                                                )
                                            }
                                            tekst={field.value ?? ''}
                                            {...field}
                                            feil={fieldState.error}
                                        />
                                    )}
                                />
                            )}
                            {watch.oppretterNyttForhåndsvarsel && (
                                <div className={styles.mottakerSection}>
                                    {mottakerFetchError && (
                                        <Alert variant={mottakerFetchError.variant} size="small">
                                            {mottakerFetchError.text}
                                        </Alert>
                                    )}
                                    <Button
                                        variant="secondary"
                                        className={styles.mottakerToggle}
                                        type="button"
                                        onClick={() => setSkalLeggeTilMottaker((prev) => !prev)}
                                        size="small"
                                        disabled={mottakerFinnes === null}
                                    >
                                        {skalLeggeTilMottaker
                                            ? formatMessage('forhåndsvarsel.knapp.lukkMottaker')
                                            : mottakerFinnes
                                              ? formatMessage('forhåndsvarsel.knapp.visMottaker')
                                              : formatMessage('forhåndsvarsel.knapp.leggTilMottaker')}
                                        {mottakerFinnes === null && (
                                            <Loader size="small" className={styles.buttonSpinner} />
                                        )}
                                    </Button>
                                    {skalLeggeTilMottaker && (
                                        <MottakerForm
                                            sakId={props.sakId}
                                            referanseId={props.revurdering.id}
                                            referanseType={'REVURDERING'}
                                            brevtype={mottakerBrevtype}
                                            onClose={() => setSkalLeggeTilMottaker(false)}
                                        />
                                    )}
                                </div>
                            )}

                            <VisDokumenter
                                id={props.revurdering.id}
                                idType={DokumentIdType.Revurdering}
                                ingenBrevTekst={formatMessage('forhåndsvarsel.dokumenterAlert.ingenForhåndsvarsel')}
                            />
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

export default ForhåndsvarselForm;
