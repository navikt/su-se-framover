import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { beregnOgSimuler } from '~features/revurdering/revurderingActions';
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
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';
import { erRevurderingSimulert } from '../revurderingUtils';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const schema = yup.object<EndringAvFradragFormData>({
    fradrag: yup.array(fradragSchema.required()).defined(),
});

const EndringAvFradrag = (props: { sakId: string; revurdering: Revurdering }) => {
    const { beregnOgSimulerStatus } = useAppSelector((state) => state.sak);
    const intl = useI18n({ messages: { ...messages, ...fradragMessages } });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const history = useHistory();

    const fradragUtenForventetInntekt = (fradrag: FradragFormData[]) => {
        return fradrag.filter((f) => {
            return f.type !== Fradragstype.ForventetInntekt;
        });
    };

    const beregnOgSimulerRevurdering = async (fradrag: FradragFormData[]) => {
        const response = await dispatch(
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
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                })),
            })
        );
        if (beregnOgSimuler.fulfilled.match(response)) {
            history.push(
                Routes.revurderValgtRevurdering.createURL({
                    sakId: props.sakId,
                    steg: RevurderingSteg.Oppsummering,
                    revurderingId: props.revurdering.id,
                })
            );
        }
    };

    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: erRevurderingSimulert(props.revurdering)
                ? fradragUtenForventetInntekt(
                      FradragTilFradragFormData(props.revurdering.beregninger.revurdert.fradrag)
                  )
                : [],
        },
        onSubmit(values) {
            beregnOgSimulerRevurdering(values.fradrag);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setHasSubmitted(true);
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
                        {beregnOgSimulerStatus.error.body?.message}
                    </AlertStripeFeil>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link
                        className="knapp"
                        to={Routes.revurderValgtRevurdering.createURL({
                            sakId: props.sakId,
                            steg: RevurderingSteg.Periode,
                            revurderingId: props.revurdering.id,
                        })}
                    >
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(beregnOgSimulerStatus)}>
                        {intl.formatMessage({ id: 'knapp.neste' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default EndringAvFradrag;
