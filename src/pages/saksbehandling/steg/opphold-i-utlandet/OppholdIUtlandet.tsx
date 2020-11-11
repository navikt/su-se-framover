import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { eqOppholdIUtlandet } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { kalkulerTotaltAntallDagerIUtlandet, Utlandsdatoer } from '~lib/dateUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { OppholdIUtlandet as OppholdIUtlandetType, OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './oppholdIUtlandet-nb';
import styles from './OppholdIUtlandet.module.less';

interface FormData {
    status: Nullable<OppholdIUtlandetStatus>;
    begrunnelse: Nullable<string>;
}

const DatoFelt = (props: { label: React.ReactNode; verdi: string | React.ReactNode }) => (
    <div>
        <Element>{props.label}</Element>
        <Normaltekst>{props.verdi}</Normaltekst>
    </div>
);

const schema = yup.object<FormData>({
    status: yup.mixed().defined().oneOf(Object.values(OppholdIUtlandetStatus), 'Vennligst velg et alternativ '),
    begrunnelse: yup.string().defined(),
});

const visDatoer = (datesArray: Utlandsdatoer, intl: IntlShape) => {
    if (!datesArray || datesArray?.length === 0) return intl.formatMessage({ id: 'display.fraSøknad.ikkeRegistert' });

    return (
        <div>
            {datesArray.map((datoRad, index) => (
                <div key={index} className={styles.datoFelterContainer}>
                    <DatoFelt
                        label={'Utreisedato'}
                        verdi={DateFns.parseISO(datoRad.utreisedato).toLocaleDateString()}
                    />
                    <DatoFelt
                        label={'Innreisedato'}
                        verdi={DateFns.parseISO(datoRad.innreisedato).toLocaleDateString()}
                    />
                </div>
            ))}
        </div>
    );
};

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.status) return;

            const oppholdIUtlandetValues: OppholdIUtlandetType = {
                status: values.status,
                begrunnelse: values.begrunnelse,
            };

            if (
                eqOppholdIUtlandet.equals(
                    oppholdIUtlandetValues,
                    props.behandling.behandlingsinformasjon.oppholdIUtlandet
                )
            ) {
                history.push(props.nesteUrl);
                return;
            }

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        oppholdIUtlandet: { ...oppholdIUtlandetValues },
                    },
                })
            );

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe
                            legend={intl.formatMessage({ id: 'radio.oppholdIUtland.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
                                name="status"
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet,
                                    }))
                                }
                                checked={formik.values.status === OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
                                name="status"
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: OppholdIUtlandetStatus.SkalHoldeSegINorge,
                                    }))
                                }
                                checked={formik.values.status === OppholdIUtlandetStatus.SkalHoldeSegINorge}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="status"
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: OppholdIUtlandetStatus.Uavklart,
                                    }))
                                }
                                checked={formik.values.status === OppholdIUtlandetStatus.Uavklart}
                            />
                        </RadioGruppe>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                            name="begrunnelse"
                            feil={formik.errors.begrunnelse}
                            value={formik.values.begrunnelse ?? ''}
                            onChange={(e) => {
                                formik.setValues((v) => ({
                                    ...v,
                                    begrunnelse: e.target.value ? e.target.value : null,
                                }));
                            }}
                        />
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                if (!formik.values.status) return;

                                dispatch(
                                    lagreBehandlingsinformasjon({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        behandlingsinformasjon: {
                                            oppholdIUtlandet: {
                                                status: formik.values.status,
                                                begrunnelse: formik.values.begrunnelse,
                                            },
                                        },
                                    })
                                );
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.antallDagerSiste90' }),
                                verdi: kalkulerTotaltAntallDagerIUtlandet(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.registrertePerioder
                                ).toString(),
                            },
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.antallDagerPlanlagt' }),
                                verdi: kalkulerTotaltAntallDagerIUtlandet(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.planlagtePerioder
                                ).toString(),
                            },
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.datoerSiste90' }),
                                verdi: visDatoer(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.registrertePerioder,
                                    intl
                                ),
                            },
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.datoerPlanlagt' }),
                                verdi: visDatoer(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.planlagtePerioder,
                                    intl
                                ),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default OppholdIUtlandet;
