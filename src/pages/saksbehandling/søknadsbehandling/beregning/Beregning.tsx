import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Heading, Loader, Textarea } from '@navikt/ds-react';
import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import FradragForm from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragForm';
import {
    eqFradragFormData,
    FradragFormData,
    fradragFormdataTilFradrag,
    fradragSchema,
    fradragTilFradragFormData,
} from '~src/components/forms/vilkårOgGrunnlagForms/fradrag/FradragFormUtils';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import Feiloppsummering from '~src/components/oppsummering/feiloppsummering/Feiloppsummering';
import OppsummeringAvBeregning from '~src/components/oppsummering/oppsummeringAvBeregningOgsimulering/oppsummeringAvBeregning/OppsummeringAvBeregning';
import OppsummeringAvEksternGrunnlagSkatt from '~src/components/oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';
import OppsummeringAvInntektOgPensjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvInntektOgPensjon';
import OppsummeringAvFradrag from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFradrag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import * as SøknadsbehandlingActions from '~src/features/SøknadsbehandlingActions';
import { pipe } from '~src/lib/fp';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Fradrag } from '~src/types/Fradrag';
import { NullablePeriode } from '~src/types/Periode';
import { Person } from '~src/types/Person';
import {
    EksisterendeVedtaksinformasjonTidligerePeriodeResponse,
    Søknadsbehandling,
    SøknadsbehandlingStatus,
} from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { erIGyldigStatusForÅKunneBeregne } from '~src/utils/BeregningUtils';
import * as DateUtils from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { kanSimuleres } from '~src/utils/SøknadsbehandlingUtils';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import styles from './beregning.module.less';
import messages from './beregning-nb';

interface FormData {
    fradrag: FradragFormData[];
    begrunnelse: Nullable<string>;
}

const getInitialValues = (
    fradrag: Fradrag[],
    beregningsDato: Nullable<NullablePeriode>,
    begrunnelse?: Nullable<string>,
): FormData => ({
    fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map((f) =>
        fradragTilFradragFormData(f, beregningsDato),
    ),
    begrunnelse: begrunnelse ?? '',
});

type ExtendedBeregningProps = {
    søker: Person;
    tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
};

const Beregning = (props: VilkårsvurderingBaseProps & ExtendedBeregningProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const [lagreFradragstatus, lagreFradrag] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreFradragsgrunnlag);
    const [beregningStatus, beregn] = useAsyncActionCreator(SøknadsbehandlingActions.startBeregning);
    const [simuleringStatus, simuler] = useAsyncActionCreator(SøknadsbehandlingActions.startSimulering);

    const stønadsperiode = useMemo(() => {
        const fom = props.behandling.stønadsperiode?.periode.fraOgMed;
        const tom = props.behandling.stønadsperiode?.periode.tilOgMed;
        if (!fom || !tom) {
            return null;
        }
        return {
            fraOgMed: DateUtils.parseIsoDateOnly(fom),
            tilOgMed: DateUtils.parseIsoDateOnly(tom),
        };
    }, [props.behandling.stønadsperiode]);

    const initialFormData = useMemo<FormData>(
        () =>
            getInitialValues(
                props.behandling.grunnlagsdataOgVilkårsvurderinger.fradrag,
                stønadsperiode,
                props.behandling.beregning?.begrunnelse,
            ),
        [props.behandling.grunnlagsdataOgVilkårsvurderinger.fradrag],
    );

    if (!erIGyldigStatusForÅKunneBeregne(props.behandling) || stønadsperiode === null) {
        return <div>{formatMessage('beregning.behandlingErIkkeFerdig')}</div>;
    }

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Beregning,
        (values) => eqBeregningFormData.equals(values, initialFormData),
    );

    const lagreFradragsgrunnlag = async (values: FormData) =>
        lagreFradrag({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
            fradrag: values.fradrag.map((f) =>
                fradragFormdataTilFradrag(f, {
                    fraOgMed: stønadsperiode.fraOgMed!,
                    tilOgMed: stønadsperiode.tilOgMed!,
                }),
            ),
            behandlingstype: Behandlingstype.Søknadsbehandling,
        });

    const lagreFradragOgBeregn = async (values: FormData, onSuccess: (behandling: Søknadsbehandling) => void) => {
        if (eqBeregningFormData.equals(values, initialFormData)) {
            clearDraft();
        }

        if (!getEq(eqFradragFormData).equals(values.fradrag, initialFormData.fradrag)) {
            await lagreFradragsgrunnlag(values);
        }

        beregn(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                begrunnelse: values.begrunnelse,
            },
            (b) => {
                onSuccess(b);
            },
        );
    };

    const handleNesteClick = async () => {
        const validForm = form.trigger().then(() => form.formState.isValid);
        if (!validForm) {
            return;
        }
        if (
            !props.behandling.beregning ||
            erFradragUlike(props.behandling.beregning?.fradrag, form.getValues('fradrag'), stønadsperiode) ||
            props.behandling.beregning.begrunnelse !== form.getValues('begrunnelse')
        ) {
            return setNeedsBeregning(true);
        }

        if (!kanSimuleres(props.behandling)) {
            if (props.behandling.status === SøknadsbehandlingStatus.BEREGNET_AVSLAG) {
                return navigate(props.nesteUrl);
            }

            return setNeedsBeregning(true);
        }

        simuler(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            },
            () => navigate(props.nesteUrl),
        );
    };

    const form = useForm<FormData>({
        defaultValues: draft ?? initialFormData,
        resolver: yupResolver(
            yup.object<FormData>({
                fradrag: yup.array<FradragFormData>(fradragSchema.required()).defined(),
                begrunnelse: yup.string(),
            }),
        ),
    });

    const onSubmit = (values: FormData) => {
        lagreFradragOgBeregn(values, (b) => {
            clearDraft();
            setNeedsBeregning(false);
            form.reset(
                getInitialValues(b.grunnlagsdataOgVilkårsvurderinger.fradrag, stønadsperiode, b.beregning?.begrunnelse),
            );
        });
    };

    useDraftFormSubscribe(form.watch);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Heading level="2" size="medium">
                            Fradrag
                        </Heading>
                        <div className={styles.container}>
                            <FradragForm
                                name={'fradrag'}
                                control={form.control}
                                setValue={form.setValue}
                                beregningsDato={stønadsperiode}
                                harEPS={
                                    hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger).fnr !==
                                    null
                                }
                                readonly={false}
                            />
                        </div>
                        <div className={styles.textareaContainer}>
                            <Controller
                                control={form.control}
                                name={'begrunnelse'}
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        {...field}
                                        label={formatMessage('input.label.begrunnelse')}
                                        value={field.value ?? ''}
                                        error={fieldState.error?.message}
                                        description={formatMessage('input.begrunnelse.description')}
                                    />
                                )}
                            />
                        </div>
                        <Heading level="2" size="medium">
                            Beregning
                            {props.behandling.beregning &&
                                ` ${DateUtils.formatMonthYear(props.behandling.beregning.fraOgMed)} -
                                ${DateUtils.formatMonthYear(props.behandling.beregning.tilOgMed)}`}
                        </Heading>
                        <div className={styles.beregningsContainer}>
                            {props.behandling.beregning && (
                                <OppsummeringAvBeregning
                                    //vil ikkke vise link til skattegrunnlaget her
                                    eksternGrunnlagSkatt={null}
                                    beregning={props.behandling.beregning}
                                />
                            )}
                            <Feiloppsummering
                                tittel={formatMessage('feiloppsummering.title')}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Button
                                className={styles.beregningButton}
                                loading={RemoteData.isPending(beregningStatus)}
                                type="submit"
                            >
                                {props.behandling.beregning
                                    ? formatMessage('knapp.startNyBeregning')
                                    : formatMessage('knapp.startBeregning')}
                            </Button>

                            {props.behandling.status === SøknadsbehandlingStatus.BEREGNET_AVSLAG && (
                                <Alert variant="warning" className={styles.avslagadvarsel}>
                                    {formatMessage(
                                        props.behandling.beregning &&
                                            props.behandling.beregning.månedsberegninger.some((m) => m.beløp > 0)
                                            ? 'beregning.nullutbetalingIStartEllerSlutt'
                                            : 'beregning.førerTilAvslag',
                                    )}
                                </Alert>
                            )}
                        </div>
                        {RemoteData.isFailure(lagreFradragstatus) && <ApiErrorAlert error={lagreFradragstatus.error} />}
                        {RemoteData.isFailure(beregningStatus) && <ApiErrorAlert error={beregningStatus.error} />}
                        {needsBeregning && (
                            <div className={styles.advarselKjørBeregning}>
                                <Alert variant="warning">{formatMessage('alert.advarsel.kjørBeregningFørst')}</Alert>
                            </div>
                        )}

                        {pipe(
                            simuleringStatus,
                            RemoteData.fold(
                                () => null,
                                () => <Loader title={formatMessage('display.simulerer')} />,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null,
                            ),
                        )}
                        <Navigasjonsknapper
                            tilbake={{ url: props.forrigeUrl }}
                            neste={{
                                loading:
                                    RemoteData.isPending(lagreFradragstatus) ||
                                    RemoteData.isPending(beregningStatus) ||
                                    RemoteData.isPending(simuleringStatus),
                                onClick: () => handleNesteClick(),
                            }}
                            fortsettSenere={{
                                onClick: async () => {
                                    const validForm = await form.trigger().then(() => form.formState.isValid);
                                    if (validForm) {
                                        lagreFradragOgBeregn(form.getValues(), () => {
                                            navigate(props.avsluttUrl);
                                        });
                                    }
                                },
                            }}
                        />
                    </form>
                ),
                right: (
                    <div className={styles.høyresideContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                            <OppsummeringAvInntektOgPensjon
                                inntektOgPensjon={{
                                    søkers: props.behandling.søknad.søknadInnhold.inntektOgPensjon,
                                    eps: props.behandling.søknad.søknadInnhold.ektefelle?.inntektOgPensjon,
                                }}
                            />
                        </div>

                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvFradrag fradrag={data.grunnlagsdataOgVilkårsvurderinger.fradrag} />
                            )}
                        />

                        <OppsummeringAvEksternGrunnlagSkatt
                            medTittel
                            eksternGrunnlagSkatt={props.behandling.eksterneGrunnlag.skatt}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

function erFradragUlike(
    fradrag: Fradrag[] | undefined,
    formFradrag: FradragFormData[],
    stønadsperiode: Nullable<NullablePeriode>,
): boolean {
    if (!fradrag) return true;

    const fradragFraDatabase = fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map((f) =>
        fradragTilFradragFormData(f, stønadsperiode),
    );

    return !getEq(eqFradragFormData).equals(formFradrag, fradragFraDatabase);
}

const eqBeregningFormData = struct<FormData>({
    fradrag: getEq(eqFradragFormData),
    begrunnelse: eqNullable(S.Eq),
});

export default Beregning;
