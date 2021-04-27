import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { beregnOgSimuler, lagreUføregrunnlag } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { fradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { UførhetInput } from '~pages/saksbehandling/steg/uførhet/UføreInput';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';
import { Revurdering } from '~types/Revurdering';
import { UføreResultat } from '~types/Vilkår';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import uføreMessage from '../../steg/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import { erGregulering, erRevurderingSimulert } from '../revurderingUtils';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
    forventetInntekt: Nullable<string>;
    uføregrad: Nullable<string>;
}

enum SubmittedStatus {
    NOT_SUBMITTED,
    NESTE,
    LAGRE,
}

const EndringAvFradrag = (props: { sakId: string; revurdering: Revurdering }) => {
    const { beregnOgSimulerStatus } = useAppSelector((state) => state.sak);
    const intl = useI18n({ messages: { ...sharedMessages, ...fradragMessages, ...uføreMessage } });
    const dispatch = useAppDispatch();
    const history = useHistory();

    const [submittedStatus, setSubmittedStatus] = useState<SubmittedStatus>(SubmittedStatus.NOT_SUBMITTED);

    const hasSubmitted = () => submittedStatus === SubmittedStatus.NESTE || submittedStatus === SubmittedStatus.LAGRE;

    const fradragUtenForventetInntekt = (fradrag: FradragFormData[]) => {
        return fradrag.filter((f) => {
            return f.type !== Fradragstype.ForventetInntekt;
        });
    };

    const handleLagreOgFortsettSenereClick = async () => {
        if (await beregnOgSimulerRevurdering(formik.values)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const beregnOgSimulerRevurdering = async (values: EndringAvFradragFormData): Promise<boolean> => {
        const res = await dispatch(
            lagreUføregrunnlag({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                uføregrad: values.uføregrad ? parseInt(values.uføregrad, 10) : null,
                forventetInntekt: values.forventetInntekt ? parseInt(values.forventetInntekt, 10) : null,
                periode: {
                    fraOgMed: props.revurdering.periode.fraOgMed,
                    tilOgMed: props.revurdering.periode.tilOgMed,
                },
            })
        );

        if (!res || !lagreUføregrunnlag.fulfilled.match(res)) return false;

        return beregnOgSimuler.fulfilled.match(
            await dispatch(
                beregnOgSimuler({
                    sakId: props.sakId,
                    revurderingId: props.revurdering.id,
                    periode: {
                        fraOgMed: props.revurdering.periode.fraOgMed,
                        tilOgMed: props.revurdering.periode.tilOgMed,
                    },
                    fradrag: values.fradrag.map((f: FradragFormData) => ({
                        periode: null,
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
            )
        );
    };

    const schema = erGregulering(props.revurdering.årsak)
        ? yup.object<EndringAvFradragFormData>({
              fradrag: yup.array(fradragSchema.required()).defined(),
              uføregrad: (yup
                  .number()
                  .nullable()
                  .defined()
                  .when('status', {
                      is: UføreResultat.VilkårOppfylt,
                      then: yup.number().positive().min(1).max(100).required().typeError('Feltet må være et tall'),
                      otherwise: yup.number().nullable().defined(),
                  }) as unknown) as yup.Schema<string>,
              forventetInntekt: (yup
                  .number()
                  .nullable()
                  .defined()
                  .when('status', {
                      is: UføreResultat.VilkårOppfylt,
                      then: yup.number().positive().integer().min(0).required().typeError('Feltet må være et tall'),
                      otherwise: yup.number().nullable().defined(),
                  }) as unknown) as yup.Schema<string>,
          })
        : yup.object<EndringAvFradragFormData>({
              fradrag: yup.array(fradragSchema.required()).defined(),
              forventetInntekt: yup.string().nullable().defined(),
              uføregrad: yup.string().nullable().defined(),
          });
    const uføregrunnlag = props.revurdering.grunnlag.uføre[0];
    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: erRevurderingSimulert(props.revurdering)
                ? fradragUtenForventetInntekt(
                      props.revurdering.beregninger.revurdert.fradrag.map(fradragTilFradragFormData)
                  )
                : [],
            forventetInntekt: uføregrunnlag.forventetInntekt ? String(uføregrunnlag.forventetInntekt) : null,
            uføregrad: uføregrunnlag.uføregrad ? String(uføregrunnlag.uføregrad) : null,
        },
        async onSubmit(values) {
            if (await beregnOgSimulerRevurdering(values)) {
                history.push(
                    Routes.revurderValgtRevurdering.createURL({
                        sakId: props.sakId,
                        steg: RevurderingSteg.Oppsummering,
                        revurderingId: props.revurdering.id,
                    })
                );
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted(),
    });

    const feilkodeTilFeilmelding = (feilkode: string | undefined) => {
        switch (feilkode) {
            case 'fant_ikke_revurdering':
                return intl.formatMessage({ id: 'feil.fant.ikke.revurdering' });
            case 'ugyldig_tilstand':
                return intl.formatMessage({ id: 'feil.ugyldig.tilstand' });
            case 'siste_måned_ved_nedgang_i_stønaden':
                return intl.formatMessage({ id: 'feil.siste.måned.ved.nedgang.i.stønaden' });
            case 'simulering_feilet':
                return intl.formatMessage({ id: 'feil.simulering.feilet' });
            case 'ufullstendig_behandlingsinformasjon':
                return intl.formatMessage({ id: 'feil.ufullstendig.behandlingsinformasjon' });
            default:
                return intl.formatMessage({ id: 'feil.ukjentFeil' });
        }
    };

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setSubmittedStatus(SubmittedStatus.NESTE);
                formik.handleSubmit(e);
            }}
        >
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'revurdering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                <Ingress>{intl.formatMessage({ id: 'periode.overskrift' })}</Ingress>
                <div className={styles.periodeContainer}>
                    <p>
                        {`${props.revurdering.periode.fraOgMed} -
                        ${props.revurdering.periode.tilOgMed} `}
                    </p>
                </div>
                {erGregulering(props.revurdering.årsak) && (
                    <div className={styles.forventetInntektContainer}>
                        <UførhetInput
                            tittel={intl.formatMessage({ id: 'input.label.uføregrad' })}
                            inputName="uføregrad"
                            inputTekst="%"
                            bredde="XS"
                            value={formik.values.uføregrad ?? ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.uføregrad}
                        />
                        <UførhetInput
                            tittel={intl.formatMessage({ id: 'fradrag.type.forventetinntekt' })}
                            inputName="forventetInntekt"
                            inputTekst=" NOK"
                            bredde="L"
                            value={formik.values.forventetInntekt ?? ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.forventetInntekt}
                        />
                    </div>
                )}
                <div className={styles.fradragInputsContainer}>
                    <FradragInputs
                        harEps={props.revurdering.tilRevurdering.behandlingsinformasjon.ektefelle ? true : false}
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
                {RemoteData.isFailure(beregnOgSimulerStatus) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {feilkodeTilFeilmelding(beregnOgSimulerStatus.error.body?.code)}
                    </AlertStripeFeil>
                )}
                <RevurderingBunnknapper
                    onNesteClick="submit"
                    tilbakeUrl={Routes.revurderValgtRevurdering.createURL({
                        sakId: props.sakId,
                        steg: RevurderingSteg.Periode,
                        revurderingId: props.revurdering.id,
                    })}
                    onLagreOgFortsettSenereClick={() => {
                        setSubmittedStatus(SubmittedStatus.LAGRE);
                        customFormikSubmit(formik, handleLagreOgFortsettSenereClick);
                    }}
                    onNesteClickSpinner={
                        submittedStatus === SubmittedStatus.NESTE && RemoteData.isPending(beregnOgSimulerStatus)
                    }
                    onLagreOgFortsettSenereClickSpinner={
                        submittedStatus === SubmittedStatus.LAGRE && RemoteData.isPending(beregnOgSimulerStatus)
                    }
                />
            </div>
        </form>
    );
};

export default EndringAvFradrag;
