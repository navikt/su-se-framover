import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqInstitusjonsopphold } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import {
    InstitusjonsoppholdStatus,
    Institusjonsopphold as InstitusjonsoppholdType,
} from '~types/Behandlingsinformasjon';

import InstitusjonsoppholdBlokk from '../faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './institusjonsopphold-nb';

interface InstitusjonsoppholdFormData {
    status: Nullable<InstitusjonsoppholdStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<InstitusjonsoppholdFormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf(
            [
                InstitusjonsoppholdStatus.VilkårOppfylt,
                InstitusjonsoppholdStatus.VilkårIkkeOppfylt,
                InstitusjonsoppholdStatus.Uavklart,
            ],
            'Vennligst velg et alternativ'
        ),
    begrunnelse: yup.string().defined(),
});

const Institusjonsopphold = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<InstitusjonsoppholdFormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.institusjonsopphold?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.institusjonsopphold?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const handleSave = async (values: InstitusjonsoppholdFormData, nesteUrl: string) => {
        if (!values.status) return;

        const institusjonsValues: InstitusjonsoppholdType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (
            eqInstitusjonsopphold.equals(
                institusjonsValues,
                props.behandling.behandlingsinformasjon.institusjonsopphold
            )
        ) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    institusjonsopphold: institusjonsValues,
                },
            })
        );
        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

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
                            legend={intl.formatMessage({ id: 'radio.institusjonsoppholdFørerTilAvslag.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
                                name="institusjonsopphold"
                                checked={formik.values.status === InstitusjonsoppholdStatus.VilkårIkkeOppfylt}
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: InstitusjonsoppholdStatus.VilkårIkkeOppfylt,
                                    }))
                                }
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
                                name="institusjonsopphold"
                                checked={formik.values.status === InstitusjonsoppholdStatus.VilkårOppfylt}
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: InstitusjonsoppholdStatus.VilkårOppfylt,
                                    }))
                                }
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="institusjonsopphold"
                                checked={formik.values.status === InstitusjonsoppholdStatus.Uavklart}
                                onChange={() =>
                                    formik.setValues((v) => ({
                                        ...v,
                                        status: InstitusjonsoppholdStatus.Uavklart,
                                    }))
                                }
                            />
                        </RadioGruppe>
                        <div className={sharedStyles.textareaContainer}>
                            <Textarea
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
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
                right: (
                    <InstitusjonsoppholdBlokk
                        søknadInnhold={props.behandling.søknad.søknadInnhold}
                        brukUndertittel={true}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default Institusjonsopphold;
