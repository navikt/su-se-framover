import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import { Eq } from 'fp-ts/lib/Eq';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import ToKolonner from '~components/toKolonner/ToKolonner';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { Flyktning as FlyktningType, FlyktningStatus, UførhetStatus } from '~types/Behandlingsinformasjon';
import { erUnderkjent, erVilkårsvurderingerVurdertAvslag } from '~Utils/behandling/behandlingUtils';

import { FlyktningFaktablokk } from '../../../../components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './flyktning-nb';

interface FormData {
    status: Nullable<FlyktningStatus>;
    begrunnelse: Nullable<string>;
}

const eqFlyktning: Eq<Nullable<FlyktningType>> = {
    equals: (flyktning1, flyktning2) =>
        flyktning1?.status === flyktning2?.status && flyktning1?.begrunnelse === flyktning2?.begrunnelse,
};

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
    const { intl } = useI18n({ messages: { ...sharedI18n, ...messages } });

    const vilGiTidligAvslag = (): boolean => {
        return (
            props.behandling.behandlingsinformasjon.uførhet?.status === UførhetStatus.VilkårIkkeOppfylt ||
            formik.values?.status === FlyktningStatus.VilkårIkkeOppfylt
        );
    };
    const goToVedtak = () => {
        history.push(
            Routes.saksbehandlingSendTilAttestering.createURL({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
            })
        );
    };

    const handleLagreOgFortsettSenere = async (values: FormData) => {
        if (!values.status) return;

        const flyktningValues: FlyktningType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFlyktning.equals(flyktningValues, props.behandling.behandlingsinformasjon.flyktning)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: flyktningValues,
                },
            })
        );

        if (!res) return;

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (!values.status) return;

        const flyktningValues: FlyktningType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFlyktning.equals(flyktningValues, props.behandling.behandlingsinformasjon.flyktning)) {
            if (erVilkårsvurderingerVurdertAvslag(props.behandling) || erUnderkjent(props.behandling)) {
                goToVedtak();
                return;
            }

            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: flyktningValues,
                },
            })
        );

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            if (res.payload.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                goToVedtak();
                return;
            }
            history.push(nesteUrl);
        }
    };

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.flyktning?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();

    return (
        <ToKolonner tittel={intl.formatMessage({ id: 'page.tittel' })}>
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
                        <div className={sharedStyles.textareaContainer}>
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
                        </div>

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
                            <AlertStripe className={sharedStyles.avslagAdvarsel} type="info">
                                {intl.formatMessage({ id: 'display.avslag.advarsel' })}
                            </AlertStripe>
                        )}

                        <Feiloppsummering
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleLagreOgFortsettSenere(formik.values);
                                    }
                                });
                            }}
                            nesteKnappTekst={
                                vilGiTidligAvslag() ? intl.formatMessage({ id: 'knapp.tilVedtaket' }) : undefined
                            }
                        />
                    </form>
                ),
                right: <FlyktningFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Flyktning;
