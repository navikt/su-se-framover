import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import { lastDayOfMonth } from 'date-fns';
import { useFormik } from 'formik';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feilmelding, Ingress, Innholdstittel } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as revurderingSlice from '~features/revurdering/revurdering.slice';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { FradragTilFradragFormData } from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/beregningUtils';
import {
    FradragFormData,
    FradragInputs,
    fradragSchema,
} from '~pages/saksbehandling/steg/beregningOgSimulering/beregning/FradragInputs';
import { RevurderingSteg } from '~pages/saksbehandling/types';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { Beregning } from '~types/Beregning';
import { Fradragstype, FradragTilhører } from '~types/Fradrag';

import fradragMessages from '../../steg/beregningOgSimulering/beregning/beregning-nb';
import messages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import styles from './endringAvFradrag.module.less';

interface EndringAvFradragFormData {
    fradrag: FradragFormData[];
}

const schema = yup.object<EndringAvFradragFormData>({
    fradrag: yup.array(fradragSchema.required()).defined(),
});

const EndringAvFradrag = (props: {
    sakId: string;
    periode: { fom: Nullable<Date>; tom: Nullable<Date> };
    innvilgedeBehandlinger: Behandling[];
    leggTilVerdi: (keynavn: 'forventetInntekt' | 'behandlingId', value: string | Beregning | number) => void;
}) => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { beregnOgSimulerStatus: beregnOgSimuler } = useAppSelector((state) => state.revurdering);
    const intl = useI18n({ messages: { ...messages, ...fradragMessages } });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

    if (!props.periode.fom || !props.periode.tom) {
        return (
            <div className={sharedStyles.revurderingContainer}>
                <Innholdstittel className={sharedStyles.tittel}>
                    {intl.formatMessage({ id: 'revurdering.tittel' })}
                </Innholdstittel>
                <div className={sharedStyles.mainContentContainer}>
                    <div>
                        <Feilmelding className={sharedStyles.feilmelding}>
                            {intl.formatMessage({ id: 'revurdering.noeGikkGalt' })}
                        </Feilmelding>
                    </div>
                    <div className={sharedStyles.knappContainer}>
                        <Link
                            className="knapp"
                            to={Routes.revurderValgtSak.createURL({
                                sakId: props.sakId,
                                steg: RevurderingSteg.Periode,
                            })}
                        >
                            {intl.formatMessage({ id: 'knapp.forrige' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getBehandlingForPeriode = (periode: { fom: Date; tom: Date }) => {
        const innvilgedeBehandlinger = props.innvilgedeBehandlinger.filter((b) => {
            return (
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                //Innvilgede behandlinger har alltid en beregning
                (DateFns.isBefore(DateFns.parseISO(b.beregning!.fraOgMed), periode.fom) ||
                    DateFns.isEqual(DateFns.parseISO(b.beregning!.fraOgMed), periode.fom)) &&
                (DateFns.isAfter(DateFns.parseISO(b.beregning!.tilOgMed), periode.tom) ||
                    DateFns.isEqual(DateFns.parseISO(b.beregning!.tilOgMed), periode.tom))
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            );
        });
        return innvilgedeBehandlinger[0];
    };

    const behandling = getBehandlingForPeriode({ fom: props.periode.fom, tom: props.periode.tom });

    const beregnOgSimulerRevurdering = (values: EndringAvFradragFormData) => {
        return dispatch(
            revurderingSlice.beregnOgSimuler({
                sakId: props.sakId,
                behandlingId: behandling.id,
                //valdiering sikrer at feltet ikke er null
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                fom: props.periode.fom!,
                tom: lastDayOfMonth(props.periode.tom!),
                fradrag: values.fradrag.map((f) => ({
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
            })
        );
    };

    const fradragUtenForventetInntekt = (fradrag: FradragFormData[]) => {
        return fradrag.filter((f) => {
            return f.type !== Fradragstype.ForventetInntekt;
        });
    };

    const formik = useFormik<EndringAvFradragFormData>({
        initialValues: {
            fradrag: RemoteData.isSuccess(beregnOgSimuler)
                ? fradragUtenForventetInntekt(FradragTilFradragFormData(beregnOgSimuler.value.beregning.fradrag))
                : fradragUtenForventetInntekt(
                      FradragTilFradragFormData(
                          /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
                          getBehandlingForPeriode({ fom: props.periode.fom, tom: props.periode.tom }).beregning!.fradrag
                      )
                  ),
        },
        async onSubmit(values) {
            const beregnOgSimuler = await beregnOgSimulerRevurdering(values);
            if (revurderingSlice.beregnOgSimuler.rejected.match(beregnOgSimuler)) {
                return;
            }
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            props.leggTilVerdi('forventetInntekt', behandling.behandlingsinformasjon.uførhet!.forventetInntekt!);
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            //TODO: muligens må fjernes når vi finner ut mer om hvordan brev skal fungere for revurdering
            props.leggTilVerdi('behandlingId', behandling.id);

            history.push(Routes.revurderValgtSak.createURL({ sakId: props.sakId, steg: RevurderingSteg.Oppsummering }));
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
                        {intl.formatDate(props.periode.fom, {
                            year: 'numeric',
                            month: '2-digit',
                        })}{' '}
                        -{' '}
                        {intl.formatDate(props.periode.tom, {
                            year: 'numeric',
                            month: '2-digit',
                        })}
                    </p>
                </div>
                <div className={styles.fradragInputsContainer}>
                    <FradragInputs
                        harEps={true}
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
                                        tilhørerEPS: false,
                                    },
                                ],
                            });
                        }}
                    />
                </div>
                {RemoteData.isFailure(beregnOgSimuler) && (
                    <AlertStripeFeil className={sharedStyles.alertstripe}>
                        {beregnOgSimuler.error.body?.message}
                    </AlertStripeFeil>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link
                        className="knapp"
                        to={Routes.revurderValgtSak.createURL({ sakId: props.sakId, steg: RevurderingSteg.Periode })}
                    >
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(beregnOgSimuler)}>
                        {intl.formatMessage({ id: 'knapp.neste' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default EndringAvFradrag;
