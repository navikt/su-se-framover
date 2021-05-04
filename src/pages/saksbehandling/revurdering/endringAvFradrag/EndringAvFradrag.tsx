import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { beregnOgSimuler } from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { fradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { useAppDispatch } from '~redux/Store';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';
import { Revurdering } from '~types/Revurdering';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import uføreMessages from '../../steg/uførhet/uførhet-nb';
import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import { erRevurderingSimulert } from '../revurderingUtils';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

enum SubmittedStatus {
    NOT_SUBMITTED,
    NESTE,
    LAGRE,
}

const EndringAvFradrag = (props: { sakId: string; revurdering: Revurdering; forrigeUrl: string; nesteUrl: string }) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...fradragMessages, ...uføreMessages } });
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [beregnOgSimulerStatus, setBeregnOgSimulerStatus] = useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );

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
        setBeregnOgSimulerStatus(RemoteData.pending);
        const res = await dispatch(
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
        );
        if (beregnOgSimuler.fulfilled.match(res)) {
            setBeregnOgSimulerStatus(RemoteData.success(null));
            return true;
        } else if (beregnOgSimuler.rejected.match(res)) {
            setBeregnOgSimulerStatus(RemoteData.failure(res.payload!));
        }
        return false;
    };

    const schema = yup.object<EndringAvFradragFormData>({
        fradrag: yup.array(fradragSchema.required()).defined(),
    });
    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: erRevurderingSimulert(props.revurdering)
                ? fradragUtenForventetInntekt(
                      props.revurdering.beregninger.revurdert.fradrag.map(fradragTilFradragFormData)
                  )
                : [],
        },
        async onSubmit(values) {
            if (await beregnOgSimulerRevurdering(values)) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted(),
    });

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
                    <RevurderingskallFeilet error={beregnOgSimulerStatus.error} />
                )}
                <RevurderingBunnknapper
                    onNesteClick="submit"
                    tilbakeUrl={props.forrigeUrl}
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
