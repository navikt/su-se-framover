import { useFormik } from 'formik';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Feiloppsummering } from 'nav-frontend-skjema';
import { Systemtittel, Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';
import { useHistory } from 'react-router-dom';

import ToKolonner from '~components/toKolonner/ToKolonner';
import fradragstypeMessages from '~features/fradrag/fradragstyper-nb';
import { getFradragstypeStringMedEpsSpesifisering } from '~features/fradrag/fradragUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { groupByEq } from '~lib/arrayUtils';
import * as DateUtils from '~lib/dateUtils';
import { formatCurrency } from '~lib/formatUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { eqNullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { fradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { Fradrag } from '~types/Fradrag';
import { eqStringPeriode } from '~types/Periode';
import { Revurdering } from '~types/Revurdering';
import { GrunnlagsdataOgVilkårsvurderinger } from '~types/Vilkår';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import uføreMessages from '../../steg/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import messages from '../endringAvFradrag/endringAvFradrag-nb';
import styles from '../endringAvFradrag/endringAvFradrag.module.less';
import sharedStyles from '../revurdering.module.less';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

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

const Bosituasjon = (props: {
    sakId: string;
    revurdering: Revurdering;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    forrigeUrl: string;
    nesteUrl: string;
}) => {
    const intl = useI18n({
        messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages, ...fradragstypeMessages },
    });
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const [pressedButton, setPressedButton] = React.useState<'ingen' | 'neste' | 'lagre'>('ingen');

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array(fradragSchema.required()).defined(),
    });
    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: props.revurdering.grunnlagsdataOgVilkårsvurderinger.fradrag.map(fradragTilFradragFormData),
        },
        async onSubmit(values) {
            setPressedButton('neste');
            console.log(values);
            const res = true; // todo dispatch kall till backend
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
                                        props.revurdering.tilRevurdering.behandlingsinformasjon.ektefelle ? true : false
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
                            <RevurderingBunnknapper
                                onNesteClick="submit"
                                tilbakeUrl={props.forrigeUrl}
                                onLagreOgFortsettSenereClick={() => {
                                    setHasSubmitted(true);
                                }}
                                onNesteClickSpinner={pressedButton === 'neste'}
                                onLagreOgFortsettSenereClickSpinner={pressedButton === 'lagre'}
                            />
                        </div>
                    </form>
                ),
                right: <GjeldendeFradrag fradrag={props.grunnlagsdataOgVilkårsvurderinger.fradrag} />,
            }}
        </ToKolonner>
    );
};

export default Bosituasjon;
