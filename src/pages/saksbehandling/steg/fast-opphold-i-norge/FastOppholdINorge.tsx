import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FastOppholdINorgeStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../Faktablokk';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

interface FormData {
    status: Nullable<FastOppholdINorgeStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed<FastOppholdINorgeStatus>()
        .defined()
        .oneOf(
            [
                FastOppholdINorgeStatus.Uavklart,
                FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                FastOppholdINorgeStatus.VilkårOppfylt,
            ],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().defined(),
});

const createFaktaBlokkArray = (søknadsInnhold: SøknadInnhold) => {
    const arr = [];
    arr.push({
        tittel: 'Er søker norsk statsborger?',
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger ? 'Ja' : 'Nei',
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: 'Har oppholdstillatelse?',
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse ? 'Ja' : 'Nei',
        });
        arr.push({
            tittel: 'Type oppholdstillatelse',
            verdi: søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse ?? 'Ikke registert',
        });
    }
    return arr;
};

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.status) return;

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        fastOppholdINorge: {
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
    const updateBehandlingsinformasjon = () => {
        if (!formik.values.status) return;

        dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    fastOppholdINorge: {
                        status: formik.values.status,
                        begrunnelse: formik.values.begrunnelse,
                    },
                },
            })
        );
    };

    return (
        <Vurdering tittel="Fast opphold i Norge?">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <RadioGruppe legend="Oppholder søker sig fast i Norge" feil={formik.errors.status}>
                            <Radio
                                label="Ja"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                            />
                            <Radio
                                label="Nei"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label="Uavklart"
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: FastOppholdINorgeStatus.Uavklart })
                                }
                                defaultChecked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
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
                            onLagreOgFortsettSenereClick={updateBehandlingsinformasjon}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={createFaktaBlokkArray(props.behandling.søknad.søknadInnhold)}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default FastOppholdINorge;
