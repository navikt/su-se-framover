import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { beregnOgSimuler } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { FradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppSelector, useAppDispatch } from '~redux/Store';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';
import { Revurdering } from '~types/Revurdering';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import { erRevurderingSimulert } from '../revurderingUtils';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const schema = yup.object<EndringAvFradragFormData>({
    fradrag: yup.array(fradragSchema.required()).defined(),
});

enum SubmittedStatus {
    NOT_SUBMITTED,
    NESTE,
    LAGRE,
}

const EndringAvFradrag = (props: { sakId: string; revurdering: Revurdering }) => {
    const { beregnOgSimulerStatus } = useAppSelector((state) => state.sak);
    const intl = useI18n({ messages: { ...sharedMessages, ...fradragMessages } });
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
        const response = await beregnOgSimulerRevurdering(formik.values.fradrag);
        if (beregnOgSimuler.fulfilled.match(response)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const beregnOgSimulerRevurdering = (fradrag: FradragFormData[]) =>
        dispatch(
            beregnOgSimuler({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                periode: {
                    fraOgMed: props.revurdering.periode.fraOgMed,
                    tilOgMed: props.revurdering.periode.tilOgMed,
                },
                fradrag: fradrag.map((f: FradragFormData) => ({
                    periode: null,
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

    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: erRevurderingSimulert(props.revurdering)
                ? fradragUtenForventetInntekt(
                      FradragTilFradragFormData(props.revurdering.beregninger.revurdert.fradrag)
                  )
                : [],
        },
        async onSubmit(values) {
            const response = await beregnOgSimulerRevurdering(values.fradrag);
            if (beregnOgSimuler.fulfilled.match(response)) {
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
