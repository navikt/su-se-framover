import * as RemoteData from '@devexperts/remote-data-ts';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { kalkulerTotaltAntallDagerIUtlandet, Utlandsdatoer } from '~lib/dateUtils';
import { pipe } from '~lib/fp';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import styles from './OppholdIUtland.module.less';

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
    status: yup
        .mixed()
        .defined()
        .oneOf(
            [OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet, OppholdIUtlandetStatus.SkalHoldeSegINorge],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().defined(),
});

const visDatoer = (datesArray: Utlandsdatoer) => {
    if (!datesArray || datesArray?.length === 0) return 'Det er ikke registert noen datoer';

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

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.status) return;

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        oppholdIUtlandet: {
                            status: values.status,
                            begrunnelse: values.begrunnelse,
                        },
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
        <Vurdering tittel="Opphold i Utlandet">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe
                            legend="Har søker planlagt å oppholde seg i utlandet i mer enn 90 dager innenfor stønadsperioden?"
                            feil={formik.errors.status}
                        >
                            <Radio
                                label="Ja"
                                name="status"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet,
                                    })
                                }
                                checked={formik.values.status === OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet}
                            />
                            <Radio
                                label="Nei"
                                name="status"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: OppholdIUtlandetStatus.SkalHoldeSegINorge,
                                    })
                                }
                                checked={formik.values.status === OppholdIUtlandetStatus.SkalHoldeSegINorge}
                            />
                        </RadioGruppe>
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            feil={formik.errors.begrunnelse}
                            value={formik.values.begrunnelse ?? ''}
                            onChange={(e) => {
                                formik.setValues({
                                    ...formik.values,
                                    begrunnelse: e.target.value ? e.target.value : null,
                                });
                            }}
                        />
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>Lagrer...</NavFrontendSpinner>,
                                () => <AlertStripe type="feil">En feil skjedde under lagring</AlertStripe>,
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
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Antall dager oppholdt i utlandet siste 90 dager',
                                verdi: kalkulerTotaltAntallDagerIUtlandet(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.registrertePerioder
                                ).toString(),
                            },
                            {
                                tittel: 'Antall dager planlagt opphold i utlandet',
                                verdi: kalkulerTotaltAntallDagerIUtlandet(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.planlagtePerioder
                                ).toString(),
                            },
                            {
                                tittel: 'Datoer for opphold i siste 90 dager',
                                verdi: visDatoer(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.registrertePerioder
                                ),
                            },
                            {
                                tittel: 'Planlagt opphold i utlandet',
                                verdi: visDatoer(
                                    props.behandling.søknad.søknadInnhold.utenlandsopphold.planlagtePerioder
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
