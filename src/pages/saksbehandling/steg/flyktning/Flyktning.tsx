import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { RawIntlProvider } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FlyktningStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './flyktning-nb';

interface FormData {
    flyktningStatus: Nullable<FlyktningStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    flyktningStatus: yup
        .mixed()
        .defined()
        .oneOf(
            [FlyktningStatus.VilkårOppfylt, FlyktningStatus.VilkårIkkeOppfylt, FlyktningStatus.Uavklart],
            'Vennligst velg et alternativ'
        ),
    begrunnelse: yup.string().defined(),
});

const Flyktning = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            flyktningStatus:
                props.behandling.behandlingsinformasjon.flyktning?.status ??
                (props.behandling.søknad.søknadInnhold.flyktningsstatus.registrertFlyktning
                    ? FlyktningStatus.VilkårOppfylt
                    : FlyktningStatus.VilkårIkkeOppfylt),
            begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.flyktningStatus) return;

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        flyktning: {
                            status: values.flyktningStatus,
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
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <RawIntlProvider value={intl}>
                        <form
                            onSubmit={(e) => {
                                setHasSubmitted(true);
                                formik.handleSubmit(e);
                            }}
                        >
                            <RadioGruppe
                                legend={intl.formatMessage({ id: 'radio.flyktning.legend' })}
                                feil={formik.errors.flyktningStatus}
                            >
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.ja' })}
                                    name="registertFlyktning"
                                    onChange={() =>
                                        formik.setValues({
                                            ...formik.values,
                                            flyktningStatus: FlyktningStatus.VilkårOppfylt,
                                        })
                                    }
                                    defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårOppfylt}
                                />
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.nei' })}
                                    name="registertFlyktning"
                                    onChange={() =>
                                        formik.setValues({
                                            ...formik.values,
                                            flyktningStatus: FlyktningStatus.VilkårIkkeOppfylt,
                                        })
                                    }
                                    defaultChecked={formik.values.flyktningStatus === FlyktningStatus.VilkårIkkeOppfylt}
                                />
                                <Radio
                                    label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                    name="registertFlyktning"
                                    onChange={() =>
                                        formik.setValues({
                                            ...formik.values,
                                            flyktningStatus: FlyktningStatus.Uavklart,
                                        })
                                    }
                                    defaultChecked={formik.values.flyktningStatus === FlyktningStatus.Uavklart}
                                />
                            </RadioGruppe>
                            <Textarea
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                                name="begrunnelse"
                                value={formik.values.begrunnelse || ''}
                                onChange={(e) => {
                                    formik.setValues({
                                        ...formik.values,
                                        begrunnelse: e.target.value ? e.target.value : null,
                                    });
                                }}
                                feil={formik.errors.begrunnelse}
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
                                    if (!formik.values.flyktningStatus) return;

                                    dispatch(
                                        lagreBehandlingsinformasjon({
                                            sakId: props.sakId,
                                            behandlingId: props.behandling.id,
                                            behandlingsinformasjon: {
                                                ...props.behandling.behandlingsinformasjon,
                                                flyktning: {
                                                    status: formik.values.flyktningStatus,
                                                    begrunnelse: formik.values.begrunnelse,
                                                },
                                            },
                                        })
                                    );
                                }}
                            />
                        </form>
                    </RawIntlProvider>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        fakta={[
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.registrertFlyktning' }),
                                verdi: props.behandling.søknad.søknadInnhold.flyktningsstatus.registrertFlyktning
                                    ? intl.formatMessage({ id: 'display.fraSøknad.ja' })
                                    : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Flyktning;
