import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Heading, Loader, Textarea } from '@navikt/ds-react';
import { useFormik } from 'formik';
import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~src/lib/validering';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Vurderingknapper } from '~src/pages/saksbehandling/søknadsbehandling/Vurdering';
import { useAppDispatch } from '~src/redux/Store';
import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Fradrag, FradragTilhører } from '~src/types/Fradrag';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { kanSimuleres } from '~src/utils/behandling/behandlingUtils';
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

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages, ...fradragstypeMessages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const [lagreFradragstatus, lagreFradrag] = useAsyncActionCreator(sakSlice.lagreFradrag);
    const [beregningStatus, beregn] = useAsyncActionCreator(sakSlice.startBeregning);
    const [simuleringStatus, simuler] = useAsyncActionCreator(sakSlice.startSimulering);

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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fraOgMed: stønadsperiode.fom!,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    tilOgMed: stønadsperiode.tom!,
                })
            ),
        });

    const lagreFradragOgBeregn = async (values: FormData, onSuccess: (behandling: Behandling) => void) => {
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
        const formikErrors = await formik.validateForm();
        if (Object.values(formikErrors).length > 0) {
            return;
        }
        if (
            !props.behandling.beregning ||
            erFradragUlike(props.behandling.beregning?.fradrag, formik.values.fradrag) ||
            props.behandling.beregning.begrunnelse !== formik.values.begrunnelse
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

    const formik = useFormik<FormData>({
        initialValues: draft ?? initialFormData,
        onSubmit: (values) =>
            lagreFradragOgBeregn(values, (b) => {
                clearDraft();
                setNeedsBeregning(false);
                formik.resetForm({
                    values: getInitialValues(b.grunnlagsdataOgVilkårsvurderinger.fradrag, b.beregning?.begrunnelse),
                });
            }),
        validationSchema: yup.object<FormData>({
            fradrag: yup.array(fradragSchema.required()).defined(),
            begrunnelse: yup.string(),
        }),
        validateOnChange: false,
    });

    useDraftFromFormikValues(formik.values);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            formik.handleSubmit(e);
                        }}
                    >
                        {props.behandling.simuleringForAvkortingsvarsel && (
                            <Alert variant={'info'} className={styles.avkortingAlert}>
                                {formatMessage('alert.advarsel.avkorting')}
                            </Alert>
                        )}
                        <Heading level="2" size="medium">
                            Fradrag
                        </Heading>
                        <div className={styles.container}>
                            <FradragInputs
                                harEps={
                                    hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger).fnr !==
                                    null
                                }
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                onChange={formik.handleChange}
                                onFradragChange={(index, value) => {
                                    formik.setFieldValue(`fradrag[${index}]`, value);
                                }}
                                onFjernClick={(index) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        fradrag: formik.values.fradrag.filter((_, idx) => idx !== index),
                                    }));
                                }}
                                beregningsDato={stønadsperiode}
                                onLeggTilClick={() => {
                                    formik.setValues({
                                        ...formik.values,
                                        fradrag: [
                                            ...formik.values.fradrag,
                                            {
                                                periode: null,
                                                beløp: null,
                                                kategori: null,
                                                spesifisertkategori: null,
                                                fraUtland: false,
                                                utenlandskInntekt: {
                                                    beløpIUtenlandskValuta: '',
                                                    valuta: '',
                                                    kurs: '',
                                                },
                                                tilhørerEPS: false,
                                            },
                                        ],
                                    });
                                }}
                            />
                        </div>
                        <div className={styles.textareaContainer}>
                            <Textarea
                                label={formatMessage('input.label.begrunnelse')}
                                name="begrunnelse"
                                onChange={formik.handleChange}
                                value={formik.values.begrunnelse ?? ''}
                                error={formik.errors.begrunnelse}
                                description={formatMessage('input.begrunnelse.description')}
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
                            {formik.errors && (
                                <Feiloppsummering
                                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                    tittel={formatMessage('feiloppsummering.title')}
                                    hidden={!formikErrorsHarFeil(formik.errors)}
                                    className={styles.feiloppsummering}
                                />
                            )}
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
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                navigate(props.forrigeUrl);
                            }}
                            onNesteClick={() => {
                                handleNesteClick();
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        lagreFradragOgBeregn(formik.values, () => {
                                            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
                                        });
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <BeregningFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
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
