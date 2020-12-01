import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqLovligOppholdINorge } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { LovligOpphold, LovligOppholdStatus } from '~types/Behandlingsinformasjon';

import LovligOppholdFaktablokk from '../faktablokk/faktablokker/LovligOppholdFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './lovligOppholdINorge-nb';

interface FormData {
    status: Nullable<LovligOppholdStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed<LovligOppholdStatus>()
        .defined()
        .oneOf(
            [LovligOppholdStatus.Uavklart, LovligOppholdStatus.VilkårIkkeOppfylt, LovligOppholdStatus.VilkårOppfylt],
            'Vennligst velg et alternativ '
        ),
    begrunnelse: yup.string().defined(),
});

const LovligOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (!values.status) return;

        const lovligOppholdValues: LovligOpphold = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqLovligOppholdINorge.equals(lovligOppholdValues, props.behandling.behandlingsinformasjon.lovligOpphold)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    ...props.behandling.behandlingsinformasjon,
                    lovligOpphold: lovligOppholdValues,
                },
            })
        );

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.lovligOpphold?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.lovligOpphold?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
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
                            legend={intl.formatMessage({ id: 'radio.lovligOpphold.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: LovligOppholdStatus.VilkårOppfylt,
                                    })
                                }
                                checked={formik.values.status === LovligOppholdStatus.VilkårOppfylt}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: LovligOppholdStatus.VilkårIkkeOppfylt,
                                    })
                                }
                                checked={formik.values.status === LovligOppholdStatus.VilkårIkkeOppfylt}
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="lovligOppholdINorge"
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: LovligOppholdStatus.Uavklart })
                                }
                                checked={formik.values.status === LovligOppholdStatus.Uavklart}
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
                                        handleSave(
                                            formik.values,
                                            Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })
                                        );
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <LovligOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </Vurdering>
    );
};

export default LovligOppholdINorge;
