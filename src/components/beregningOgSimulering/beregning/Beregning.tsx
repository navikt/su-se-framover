import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Loader, Textarea } from '@navikt/ds-react';
import { formatISO } from 'date-fns';
import { FormikHelpers, useFormik } from 'formik';
import { getEq } from 'fp-ts/Array';
import * as B from 'fp-ts/lib/boolean';
import * as D from 'fp-ts/lib/Date';
import { struct } from 'fp-ts/lib/Eq';
import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/string';
import { Undertittel } from 'nav-frontend-typografi';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import {
    FradragFormData,
    isValidFradrag,
    fradragSchema,
    FradragInputs,
} from '~components/beregningOgSimulering/beregning/FradragInputs';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import BeregningFaktablokk from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/BeregningFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { Behandling, Behandlingsstatus } from '~types/Behandling';
import { Beregning } from '~types/Beregning';
import { Fradrag, Fradragstype, FradragTilhører } from '~types/Fradrag';
import { kanSimuleres } from '~utils/behandling/behandlingUtils';
import * as DateUtils from '~utils/date/dateUtils';
import fradragstypeMessages from '~utils/søknadsbehandling/fradrag/fradragstyper-nb';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';

import sharedI18n from '../../../pages/saksbehandling/søknadsbehandling/sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../../../pages/saksbehandling/søknadsbehandling/types';
import { Vurderingknapper } from '../../../pages/saksbehandling/søknadsbehandling/Vurdering';

import messages from './beregning-nb';
import styles from './beregning.module.less';
import { UtenlandskInntektFormData } from './beregningstegTypes';
import { erIGyldigStatusForÅKunneBeregne, fradragTilFradragFormData } from './beregningUtils';
import VisBeregning from './VisBeregning';

interface FormData {
    fradrag: FradragFormData[];
    begrunnelse: Nullable<string>;
}

function getInitialValues(fradrag: Fradrag[], begrunnelse?: Nullable<string>): FormData {
    return {
        fradrag: fradrag.map((f) => ({
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
            type: f.type,
            tilhørerEPS: f.tilhører === FradragTilhører.EPS,
        })),
        begrunnelse: begrunnelse ?? '',
    };
}

const Beregning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages, ...fradragstypeMessages } });
    const [needsBeregning, setNeedsBeregning] = useState(false);

    const [lagreFradragstatus, lagreFradrag] = useAsyncActionCreator(sakSlice.lagreFradrag);
    const [beregningStatus, beregn] = useAsyncActionCreator(sakSlice.startBeregning);
    const [simuleringStatus, simuler] = useAsyncActionCreator(sakSlice.startSimulering);

    const lagrefradragogberegnstatus = RemoteData.combine(lagreFradragstatus, beregningStatus);
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
        return <div>{intl.formatMessage({ id: 'beregning.behandlingErIkkeFerdig' })}</div>;
    }

    const lagreFradragOgBeregn = async (values: FormData) => {
        if (!props.behandling.behandlingsinformasjon.utledetSats) {
            return null;
        }

        const fradrag = values.fradrag.filter(isValidFradrag);
        if (fradrag.length !== values.fradrag.length) {
            return null;
        }

        return new Promise<Behandling | null>((resolve) =>
            lagreFradrag(
                {
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    fradrag: values.fradrag.map((f) => ({
                        //valdiering sikrer at feltet ikke er null
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        periode:
                            f.periode?.fraOgMed && f.periode.tilOgMed
                                ? {
                                      fraOgMed: formatISO(f.periode.fraOgMed, { representation: 'date' }),
                                      tilOgMed: formatISO(f.periode.tilOgMed, { representation: 'date' }),
                                  }
                                : {
                                      fraOgMed: formatISO(stønadsperiode.fom, { representation: 'date' }),
                                      tilOgMed: formatISO(stønadsperiode.tom, { representation: 'date' }),
                                  },

                        beløp: parseInt(f.beløp!, 10),
                        type: f.type!,
                        utenlandskInntekt: f.fraUtland
                            ? {
                                  beløpIUtenlandskValuta: parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                                  valuta: f.utenlandskInntekt.valuta,
                                  kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                              }
                            : null,
                        tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    })),
                },
                () =>
                    beregn(
                        {
                            sakId: props.sakId,
                            behandlingId: props.behandling.id,
                            begrunnelse: values.begrunnelse,
                        },
                        (behandling) => resolve(behandling),
                        () => resolve(null)
                    ),
                () => resolve(null)
            )
        );
    };

    const handleStartBeregningClick = async (values: FormData, helpers: FormikHelpers<FormData>) => {
        const b = await lagreFradragOgBeregn(values);
        if (b) {
            setNeedsBeregning(false);
            helpers.resetForm({
                values: getInitialValues(b.grunnlagsdataOgVilkårsvurderinger.fradrag, b.beregning?.begrunnelse),
            });
        }
    };

    const handleLagreOgFortsettSenereClick = async (values: FormData) => {
        const b = await lagreFradragOgBeregn(values);
        if (b) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const handleNesteClick = async () => {
        const formikErrors = await formik.validateForm();
        if (Object.values(formikErrors).length > 0) {
            return;
        }
        if (
            !props.behandling.beregning ||
            !erFradragLike(props.behandling.beregning?.fradrag, formik.values.fradrag) ||
            props.behandling.beregning.begrunnelse !== formik.values.begrunnelse
        ) {
            return setNeedsBeregning(true);
        }

        if (!kanSimuleres(props.behandling)) {
            if (props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG) {
                return history.push(props.nesteUrl);
            }

            return setNeedsBeregning(true);
        }

        simuler(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            },
            () => history.push(props.nesteUrl)
        );
    };

    const formik = useFormik<FormData>({
        initialValues: getInitialValues(
            props.behandling.grunnlagsdataOgVilkårsvurderinger.fradrag,
            props.behandling.beregning?.begrunnelse
        ),
        onSubmit: handleStartBeregningClick,
        validationSchema: yup.object<FormData>({
            fradrag: yup.array(fradragSchema.required()).defined(),
            begrunnelse: yup.string(),
        }),
        validateOnChange: false,
    });

    return (
        <ToKolonner tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            formik.handleSubmit(e);
                        }}
                    >
                        <Undertittel>Fradrag</Undertittel>
                        <div className={styles.container}>
                            <FradragInputs
                                harEps={
                                    hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger).fnr !==
                                    null
                                }
                                feltnavn="fradrag"
                                fradrag={formik.values.fradrag}
                                errors={formik.errors.fradrag}
                                intl={intl}
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
                                                type: null,
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
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                                name="begrunnelse"
                                onChange={formik.handleChange}
                                value={formik.values.begrunnelse ?? ''}
                                error={formik.errors.begrunnelse}
                            />
                        </div>

                        <Undertittel>
                            Beregning
                            {props.behandling.beregning &&
                                ` ${DateUtils.formatMonthYear(props.behandling.beregning.fraOgMed)}-
                                ${DateUtils.formatMonthYear(props.behandling.beregning.tilOgMed)}`}
                        </Undertittel>
                        <div className={styles.beregningsContainer}>
                            {props.behandling.beregning && <VisBeregning beregning={props.behandling.beregning} />}
                            {formik.errors && (
                                <Feiloppsummering
                                    feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                    tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                    hidden={!formikErrorsHarFeil(formik.errors)}
                                    className={styles.feiloppsummering}
                                />
                            )}
                            <Button type="submit" size="small">
                                {props.behandling.beregning
                                    ? intl.formatMessage({ id: 'knapp.startNyBeregning' })
                                    : intl.formatMessage({ id: 'knapp.startBeregning' })}
                                {RemoteData.isPending(lagrefradragogberegnstatus) && <Loader />}
                            </Button>

                            {props.behandling.status === Behandlingsstatus.BEREGNET_AVSLAG && (
                                <Alert variant="warning" className={styles.avslagadvarsel}>
                                    {intl.formatMessage({
                                        id:
                                            props.behandling.beregning &&
                                            props.behandling.beregning.månedsberegninger.some((m) => m.beløp > 0)
                                                ? 'beregning.nullutbetalingIStartEllerSlutt'
                                                : 'beregning.førerTilAvslag',
                                    })}
                                </Alert>
                            )}
                        </div>

                        {RemoteData.isFailure(lagrefradragogberegnstatus) && (
                            <ApiErrorAlert error={lagrefradragogberegnstatus.error} />
                        )}
                        {needsBeregning && (
                            <Alert variant="warning">
                                {intl.formatMessage({ id: 'alert.advarsel.kjørBeregningFørst' })}
                            </Alert>
                        )}
                        {pipe(
                            simuleringStatus,
                            RemoteData.fold(
                                () => null,
                                () => <Loader title={intl.formatMessage({ id: 'display.simulerer' })} />,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onNesteClick={() => {
                                handleNesteClick();
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleLagreOgFortsettSenereClick(formik.values);
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

function erFradragLike(fradrag: Fradrag[] | undefined, formFradrag: FradragFormData[]): boolean {
    if (!fradrag) return false;

    const fradragFraBasen = fradrag
        .filter((f) => f.type !== Fradragstype.ForventetInntekt)
        .map(fradragTilFradragFormData);

    return getEq(eqFradragFormData).equals(formFradrag, fradragFraBasen);
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
    type: eqNullable(S.Eq),
    beløp: eqNullable(S.Eq),
    fraUtland: B.Eq,
    utenlandskInntekt: eqUtenlandskInntekt,
    tilhørerEPS: B.Eq,
    periode: eqNullable(eqPeriode),
});

export default Beregning;
