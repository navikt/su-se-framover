import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import ToKolonner from '~components/toKolonner/ToKolonner';
import { eqOppholdIUtlandet } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { OppholdIUtlandet as OppholdIUtlandetType, OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';

import { UtenlandsOppholdFaktablokk } from '../../../../components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './oppholdIUtlandet-nb';

interface FormData {
    status: Nullable<OppholdIUtlandetStatus>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup.mixed().defined().oneOf(Object.values(OppholdIUtlandetStatus), 'Vennligst velg et alternativ '),
    begrunnelse: yup.string().defined(),
});

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (!values.status) return;

        const oppholdIUtlandetValues: OppholdIUtlandetType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (
            eqOppholdIUtlandet.equals(oppholdIUtlandetValues, props.behandling.behandlingsinformasjon.oppholdIUtlandet)
        ) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    oppholdIUtlandet: oppholdIUtlandetValues,
                },
            })
        );

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };
    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
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
                        <div className={sharedStyles.textareaContainer}>
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
                right: <UtenlandsOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
