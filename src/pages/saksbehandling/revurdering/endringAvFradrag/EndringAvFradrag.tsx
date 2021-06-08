import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel, Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import ToKolonner from '~components/toKolonner/ToKolonner';
import fradragstypeMessages from '~features/fradrag/fradragstyper-nb';
import { getFradragstypeStringMedEpsSpesifisering } from '~features/fradrag/fradragUtils';
import { lagreFradragsgrunnlag } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { groupByEq } from '~lib/arrayUtils';
import * as DateUtils from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { customFormikSubmit } from '~lib/formikUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { eqNullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { fradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { useAppDispatch } from '~redux/Store';
import { Fradrag, FradragTilhører } from '~types/Fradrag';
import { eqStringPeriode } from '~types/Periode';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import uføreMessages from '../../steg/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './endringAvFradrag-nb';
import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const GjeldendeFradrag = (props: { fradrag: Fradrag[] }) => {
    const intl = useI18n({ messages: { ...messages, ...fradragstypeMessages } });
    return (
        <div>
            <Systemtittel className={styles.grunnlagsdataHeading}>
                {intl.formatMessage({ id: 'heading.gjeldendeFradrag' })}
            </Systemtittel>
            <ul className={styles.grunnlagsliste}>
                {pipe(
                    props.fradrag,
                    groupByEq(
                        pipe(
                            eqNullable(eqStringPeriode),
                            Eq.contramap((f) => f.periode)
                        )
                    ),
                    A.mapWithIndex((idx, fradragsgruppe) => (
                        <li key={idx}>
                            <Element className={styles.grunnlagsdataPeriodeHeader}>
                                {pipe(
                                    A.head(fradragsgruppe),
                                    O.chainNullableK((head) => head.periode),
                                    O.map(
                                        (periode) =>
                                            `${DateUtils.formatMonthYear(
                                                periode.fraOgMed,
                                                intl
                                            )} – ${DateUtils.formatMonthYear(periode.tilOgMed, intl)}`
                                    ),
                                    O.getOrElse(() => intl.formatMessage({ id: 'feil.ukjent.periode' }))
                                )}
                            </Element>

                            <ul>
                                {fradragsgruppe.map((fradrag, idx) => (
                                    <li key={idx} className={styles.linje}>
                                        <span>
                                            {getFradragstypeStringMedEpsSpesifisering(
                                                fradrag.type,
                                                fradrag.tilhører,
                                                intl
                                            )}
                                        </span>
                                        <span>{formatCurrency(intl, fradrag.beløp)}</span>
                                        {fradrag.utenlandskInntekt !== null && (
                                            <>
                                                <Undertekst className={styles.detailedLinje}>
                                                    {intl.formatMessage({
                                                        id: 'fradrag.utenlandsk.beløp',
                                                    })}
                                                </Undertekst>
                                                <Undertekst className={styles.alignTextRight}>
                                                    {formatCurrency(
                                                        intl,
                                                        fradrag.utenlandskInntekt.beløpIUtenlandskValuta,
                                                        {
                                                            currency: fradrag.utenlandskInntekt.valuta,
                                                        }
                                                    )}
                                                </Undertekst>
                                                <Undertekst className={styles.detailedLinje}>
                                                    {intl.formatMessage({
                                                        id: 'fradrag.utenlandsk.kurs',
                                                    })}
                                                </Undertekst>
                                                <Undertekst className={styles.alignTextRight}>
                                                    {intl.formatNumber(fradrag.utenlandskInntekt.kurs)}
                                                </Undertekst>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

const EndringAvFradrag = (props: {
    sakId: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: string;
}) => {
    const intl = useI18n({
        messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages, ...fradragstypeMessages },
    });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);
    const [savingState, setSavingState] = React.useState<RemoteData.RemoteData<ApiError, null>>(RemoteData.initial);

    const [pressedButton, setPressedButton] = React.useState<'ingen' | 'neste' | 'lagre'>('ingen');

    const save = async (values: EndringAvFradragFormData) => {
        if (RemoteData.isPending(savingState)) {
            return false;
        }
        setSavingState(RemoteData.pending);

        const res = await dispatch(
            lagreFradragsgrunnlag({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                fradrag: values.fradrag.map((f: FradragFormData) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(
                            f.periode?.fraOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)
                        ),
                        tilOgMed: DateUtils.toIsoDateOnlyString(
                            DateUtils.sluttenAvMåneden(
                                f.periode?.tilOgMed ?? DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)
                            )
                        ),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    /* valideringa sjekker at f.beløp og f.type ikke er null */
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    beløp: Number.parseInt(f.beløp!, 10),
                    type: f.type!,
                    utenlandskInntekt: f.fraUtland
                        ? {
                              beløpIUtenlandskValuta: Number.parseInt(f.utenlandskInntekt.beløpIUtenlandskValuta),
                              valuta: f.utenlandskInntekt.valuta,
                              kurs: Number.parseFloat(f.utenlandskInntekt.kurs),
                          }
                        : null,
                    tilhører: f.tilhørerEPS ? FradragTilhører.EPS : FradragTilhører.Bruker,
                })),
            })
        );

        if (lagreFradragsgrunnlag.fulfilled.match(res)) {
            setSavingState(RemoteData.success(null));
            return true;
        } else if (lagreFradragsgrunnlag.rejected.match(res)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setSavingState(RemoteData.failure(res.payload!));
        }
        return false;
    };

    const handleLagreOgFortsettSenereClick = async () => {
        setPressedButton('lagre');
        const res = await save(formik.values);
        setPressedButton('ingen');
        if (res) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array(fradragSchema.required()).defined(),
    });
    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag.map(fradragTilFradragFormData),
        },
        async onSubmit(values) {
            setPressedButton('neste');
            const res = await save(values);
            setPressedButton('ingen');
            if (res) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <form
                        className={sharedStyles.revurderingContainer}
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div>
                            <div className={styles.fradragInputsContainer}>
                                <FradragInputs
                                    harEps={
                                        props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0].fnr !== null
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
                                    beregningsDato={{
                                        fom: new Date(props.revurdering.periode.fraOgMed),
                                        tom: new Date(props.revurdering.periode.tilOgMed),
                                    }}
                                    onLeggTilClick={() => {
                                        formik.setValues({
                                            ...formik.values,
                                            fradrag: [
                                                ...formik.values.fradrag,
                                                {
                                                    beløp: null,
                                                    type: null,
                                                    fraUtland: false,
                                                    utenlandskInntekt: {
                                                        beløpIUtenlandskValuta: '',
                                                        valuta: '',
                                                        kurs: '',
                                                    },
                                                    periode: null,
                                                    tilhørerEPS: false,
                                                },
                                            ],
                                        });
                                    }}
                                />
                            </div>
                            <Feiloppsummering
                                tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                                className={styles.feiloppsummering}
                                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                                hidden={!formikErrorsHarFeil(formik.errors)}
                            />
                            {RemoteData.isFailure(savingState) && <RevurderingskallFeilet error={savingState.error} />}
                            <RevurderingBunnknapper
                                onNesteClick="submit"
                                tilbakeUrl={props.forrigeUrl}
                                onLagreOgFortsettSenereClick={() => {
                                    setHasSubmitted(true);
                                    customFormikSubmit(formik, handleLagreOgFortsettSenereClick);
                                }}
                                onNesteClickSpinner={pressedButton === 'neste' && RemoteData.isPending(savingState)}
                                onLagreOgFortsettSenereClickSpinner={
                                    pressedButton === 'lagre' && RemoteData.isPending(savingState)
                                }
                            />
                        </div>
                    </form>
                ),
                right: <GjeldendeFradrag fradrag={props.grunnlagsdataOgVilkårsvurderinger.fradrag} />,
            }}
        </ToKolonner>
    );
};

export default EndringAvFradrag;
