import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqFlyktning } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { Flyktning as FlyktningType, FlyktningStatus, UførhetStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import styles from '../vilkår.module.less';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './flyktning-nb';

interface FormData {
    status: Nullable<FlyktningStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
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

    const vilGiTidligAvslag = (): boolean => {
        return (
            props.behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
            formik.values?.status === FlyktningStatus.VilkårIkkeOppfylt
        );
    };
    const goToVedtak = () => {
        history.push(
            Routes.saksbehandlingVedtak.createURL({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (!values.status) return;

            const flyktningValues: FlyktningType = {
                status: values.status,
                begrunnelse: values.begrunnelse,
            };

            if (eqFlyktning.equals(flyktningValues, props.behandling.behandlingsinformasjon.flyktning)) {
                if (props.behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                    goToVedtak();
                    return;
                }

                history.push(props.nesteUrl);
                return;
            }

            const res = await dispatch(
                lagreBehandlingsinformasjon({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    behandlingsinformasjon: {
                        flyktning: { ...flyktningValues },
                    },
                })
            );
            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                if (res.payload.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                    goToVedtak();

                    return;
                }

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
                            legend={intl.formatMessage({ id: 'radio.flyktning.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FlyktningStatus.VilkårOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FlyktningStatus.VilkårOppfylt}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FlyktningStatus.VilkårIkkeOppfylt,
                                    })
                                }
                                defaultChecked={formik.values.status === FlyktningStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="registertFlyktning"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FlyktningStatus.Uavklart,
                                    })
                                }
                                defaultChecked={formik.values.status === FlyktningStatus.Uavklart}
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

                        {vilGiTidligAvslag() && (
                            <AlertStripe className={styles.avslagAdvarsel} type="info">
                                {intl.formatMessage({ id: 'display.avslag.advarsel' })}
                            </AlertStripe>
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
                                            ...props.behandling.behandlingsinformasjon,
                                            flyktning: {
                                                status: formik.values.status,
                                                begrunnelse: formik.values.begrunnelse,
                                            },
                                        },
                                    })
                                );
                            }}
                            nesteKnappTekst={
                                vilGiTidligAvslag() ? intl.formatMessage({ id: 'knapp.tilVedtaket' }) : undefined
                            }
                        />
                    </form>
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
