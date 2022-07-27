import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Heading, Loader, Textarea } from '@navikt/ds-react';
import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Person } from '~src/api/personApi';
import { hentSkattemelding } from '~src/api/sakApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~src/components/beregningOgSimulering/beregning/fradragInputs/FradragInputs';
import fradragstypeMessages from '~src/components/beregningOgSimulering/beregning/fradragInputs/fradragInputs-nb';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import BeregningFaktablokk from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/BeregningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { pipe } from '~src/lib/fp';
import { useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { useAppDispatch } from '~src/redux/Store';
import { Fradrag, FradragTilhører } from '~src/types/Fradrag';
import { Behandlingsstatus, Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { kanSimuleres } from '~src/utils/behandling/SøknadsbehandlingUtils';
import * as DateUtils from '~src/utils/date/dateUtils';
import { fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold } from '~src/utils/fradrag/fradragUtil';
import { hentBosituasjongrunnlag } from '~src/utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import sharedI18n from '../../../pages/saksbehandling/søknadsbehandling/sharedI18n-nb';

import messages from './beregning-nb';
import * as styles from './beregning.module.less';
import { UtenlandskInntektFormData } from './beregningstegTypes';
import {
    erIGyldigStatusForÅKunneBeregne,
    fradragFormdataTilFradrag,
    fradragTilFradragFormData,
} from './beregningUtils';
import VisBeregning from './VisBeregning';

interface FormData {
    fradrag: FradragFormData[];
    begrunnelse: Nullable<string>;
}

function getInitialValues(fradrag: Fradrag[], begrunnelse?: Nullable<string>): FormData {
    return {
        fradrag: fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map((f) => ({
            periode: {
                fraOgMed: DateUtils.toDateOrNull(f.periode?.fraOgMed),
                tilOgMed: DateUtils.toDateOrNull(f.periode?.tilOgMed),
            },
            fraUtland: f.utenlandskInntekt !== null,
            beløp: f.beløp.toString(),
            utenlandskInntekt: {
                beløpIUtenlandskValuta: f.utenlandskInntekt?.beløpIUtenlandskValuta.toString() ?? '',
                valuta: f.utenlandskInntekt?.valuta.toString() ?? '',
                kurs: f.utenlandskInntekt?.kurs.toString() ?? '',
            },
            kategori: f.type,
            spesifisertkategori: f.beskrivelse,
            tilhørerEPS: f.tilhører === FradragTilhører.EPS,
        })),
        begrunnelse: begrunnelse ?? '',
    };
}

type Søker = { søker: Person };
const Beregning = (props: VilkårsvurderingBaseProps & Søker) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages, ...fradragstypeMessages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const [lagreFradragstatus, lagreFradrag] = useAsyncActionCreator(sakSlice.lagreFradrag);
    const [beregningStatus, beregn] = useAsyncActionCreator(sakSlice.startBeregning);
    const [simuleringStatus, simuler] = useAsyncActionCreator(sakSlice.startSimulering);

    const [skattemeldingBruker, hentSkattemeldingBruker] = useApiCall(hentSkattemelding);
    const [skattemeldingEPS, hentSkattemeldingEPS] = useApiCall(hentSkattemelding);

    const initialFormData = useMemo<FormData>(
        () =>
            getInitialValues(
                props.behandling.grunnlagsdataOgVilkårsvurderinger.fradrag,
                props.behandling.beregning?.begrunnelse
            ),
        [props.behandling.grunnlagsdataOgVilkårsvurderinger.fradrag]
    );

    const stønadsperiode = useMemo(() => {
        const fom = props.behandling.stønadsperiode?.periode.fraOgMed;
        const tom = props.behandling.stønadsperiode?.periode.tilOgMed;
        if (!fom || !tom) {
            return null;
        }
        return {
            fom: DateUtils.parseIsoDateOnly(fom),
            tom: DateUtils.parseIsoDateOnly(tom),
        };
    }, [props.behandling.stønadsperiode]);

    useEffect(() => {
        dispatch(sakSlice.default.actions.resetBeregningstatus());
    }, []);

    useEffect(() => {
        hentSkattemeldingBruker({ fnr: props.søker.fnr });
        const bosituasjon = hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger); // TODO ai: Støtte for kun 1 bosituasjon. Støtte fler i framtiden.

        if (bosituasjon?.fnr) {
            hentSkattemeldingEPS({ fnr: bosituasjon.fnr });
        }
    }, []);

    if (!erIGyldigStatusForÅKunneBeregne(props.behandling) || stønadsperiode === null) {
        return <div>{formatMessage('beregning.behandlingErIkkeFerdig')}</div>;
    }

    const { draft, clearDraft, useDraftFromFormikValues } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Beregning,
        (values) => eqBeregningFormData.equals(values, initialFormData)
    );

    const lagreFradragsgrunnlag = async (values: FormData) =>
        lagreFradrag({
            sakId: props.sakId,
            behandlingId: props.behandling.id,
            fradrag: values.fradrag.map((f) =>
                fradragFormdataTilFradrag(f, {
                    fraOgMed: stønadsperiode.fom!,
                    tilOgMed: stønadsperiode.tom!,
                })
            ),
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
            }
        );
    };

    const handleNesteClick = async () => {
        const validForm = form.trigger().then(() => form.formState.isValid);
        if (!validForm) {
            return;
        }
        if (
            !props.behandling.beregning ||
            erFradragUlike(props.behandling.beregning?.fradrag, form.getValues('fradrag')) ||
            props.behandling.beregning.begrunnelse !== form.getValues('begrunnelse')
        ) {
            return setNeedsBeregning(true);
        }

        if (!kanSimuleres(props.behandling)) {
            if (props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG) {
                return navigate(props.nesteUrl);
            }

            return setNeedsBeregning(true);
        }

        simuler(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            },
            () => navigate(props.nesteUrl)
        );
    };

    const form = useForm<FormData>({
        defaultValues: draft ?? initialFormData,
        resolver: yupResolver(
            yup.object<FormData>({
                fradrag: yup.array(fradragSchema.required()).defined(),
                begrunnelse: yup.string(),
            })
        ),
    });

    const onSubmit = (values: FormData) => {
        lagreFradragOgBeregn(values, (b) => {
            clearDraft();
            setNeedsBeregning(false);
            form.reset(getInitialValues(b.grunnlagsdataOgVilkårsvurderinger.fradrag, b.beregning?.begrunnelse));
        });
    };

    useDraftFromFormikValues(form.getValues());

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {props.behandling.simuleringForAvkortingsvarsel && (
                            <Alert variant={'info'} className={styles.avkortingAlert}>
                                {formatMessage('alert.advarsel.avkorting')}
                            </Alert>
                        )}
                        <Heading level="2" size="medium">
                            Fradrag
                        </Heading>
                        <div className={styles.container}>
                            <Controller
                                control={form.control}
                                name={'fradrag'}
                                render={({ field, fieldState }) => (
                                    <FradragInputs
                                        harEps={
                                            hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger)
                                                .fnr !== null
                                        }
                                        feltnavn={field.name}
                                        fradrag={field.value}
                                        errors={fieldState.error as FieldErrors | undefined}
                                        beregningsDato={stønadsperiode}
                                        onLeggTilClick={() =>
                                            field.onChange([
                                                ...field.value,
                                                {
                                                    beløp: null,
                                                    kategori: null,
                                                    spesifisertkategori: null,
                                                    fraUtland: false,
                                                    utenlandskInntekt: {
                                                        beløpIUtenlandskValuta: '',
                                                        valuta: '',
                                                        kurs: '',
                                                    },
                                                    periode: null,
                                                    tilhørerEPS: false,
                                                },
                                            ])
                                        }
                                        onFjernClick={(index) =>
                                            field.onChange(
                                                field.value.filter((_: FradragFormData, i: number) => index !== i)
                                            )
                                        }
                                        onFradragChange={(index, value) =>
                                            field.onChange(field.value.map((input, i) => (index === i ? value : input)))
                                        }
                                    />
                                )}
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
                                ` ${DateUtils.formatMonthYear(props.behandling.beregning.fraOgMed)}-
                                ${DateUtils.formatMonthYear(props.behandling.beregning.tilOgMed)}`}
                        </Heading>
                        <div className={styles.beregningsContainer}>
                            {props.behandling.beregning && <VisBeregning beregning={props.behandling.beregning} />}
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

                            {props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG && (
                                <Alert variant="warning" className={styles.avslagadvarsel}>
                                    {formatMessage(
                                        props.behandling.beregning &&
                                            props.behandling.beregning.månedsberegninger.some((m) => m.beløp > 0)
                                            ? 'beregning.nullutbetalingIStartEllerSlutt'
                                            : 'beregning.førerTilAvslag'
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
                                () => null
                            )
                        )}
                        <Navigasjonsknapper
                            tilbake={{ url: props.forrigeUrl }}
                            onNesteClick={() => handleNesteClick()}
                            loading={
                                RemoteData.isPending(lagreFradragstatus) ||
                                RemoteData.isPending(beregningStatus) ||
                                RemoteData.isPending(simuleringStatus)
                            }
                            onLagreOgFortsettSenereClick={() => {
                                if (form.formState.isValid) {
                                    lagreFradragOgBeregn(form.getValues(), () => {
                                        navigate(props.avsluttUrl);
                                    });
                                }
                            }}
                        />
                    </form>
                ),
                right: (
                    <BeregningFaktablokk
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                        skattegrunnlagBruker={skattemeldingBruker}
                        skattegrunnlagEPS={skattemeldingEPS}
                    />
                ),
            }}
        </ToKolonner>
    );
};

function erFradragUlike(fradrag: Fradrag[] | undefined, formFradrag: FradragFormData[]): boolean {
    if (!fradrag) return true;

    const fradragFraDatabase =
        fjernFradragSomIkkeErVelgbareEkskludertNavYtelserTilLivsopphold(fradrag).map(fradragTilFradragFormData);

    return !getEq(eqFradragFormData).equals(formFradrag, fradragFraDatabase);
}

const eqUtenlandskInntekt = struct<UtenlandskInntektFormData>({
    beløpIUtenlandskValuta: S.Eq,
    valuta: S.Eq,
    kurs: S.Eq,
});

const eqPeriode = struct<{ fraOgMed: Nullable<Date>; tilOgMed: Nullable<Date> }>({
    fraOgMed: eqNullable(D.Eq),
    tilOgMed: eqNullable(D.Eq),
});

const eqFradragFormData = struct<FradragFormData>({
    kategori: eqNullable(S.Eq),
    spesifisertkategori: eqNullable(S.Eq),
    beløp: eqNullable(S.Eq),
    fraUtland: B.Eq,
    utenlandskInntekt: eqUtenlandskInntekt,
    tilhørerEPS: B.Eq,
    periode: eqNullable(eqPeriode),
});

const eqBeregningFormData = struct<FormData>({
    fradrag: getEq(eqFradragFormData),
    begrunnelse: eqNullable(S.Eq),
});

export default Beregning;
