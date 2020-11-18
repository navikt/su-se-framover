import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { eqFastOppholdINorge } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FastOppholdINorge as FastOppholdINorgeType, FastOppholdINorgeStatus } from '~types/Behandlingsinformasjon';
import { SøknadInnhold } from '~types/Søknad';

import Faktablokk from '../faktablokk/Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './fastOppholdINorge-nb';

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

const createFaktaBlokkArray = (søknadsInnhold: SøknadInnhold, intl: IntlShape) => {
    const arr = [];
    arr.push({
        tittel: 'Er søker norsk statsborger?',
        verdi: søknadsInnhold.oppholdstillatelse.erNorskStatsborger ? 'Ja' : 'Nei',
    });
    if (!søknadsInnhold.oppholdstillatelse.erNorskStatsborger) {
        arr.push({
            tittel: 'Har oppholdstillatelse?',
            verdi: søknadsInnhold.oppholdstillatelse.harOppholdstillatelse
                ? intl.formatMessage({ id: 'display.fraSøknad.ja' })
                : intl.formatMessage({ id: 'display.fraSøknad.nei' }),
        });
        arr.push({
            tittel: 'Type oppholdstillatelse',
            verdi:
                søknadsInnhold.oppholdstillatelse.typeOppholdstillatelse ??
                intl.formatMessage({ id: 'display.fraSøknad.ikkeRegistert' }),
        });
    }
    return arr;
};

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const formik = useFormik<FormData>({
        initialValues: {
            status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const history = useHistory();
    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (!values.status) return;

        const fastOppholdValues: FastOppholdINorgeType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFastOppholdINorge.equals(fastOppholdValues, props.behandling.behandlingsinformasjon.fastOppholdINorge)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    fastOppholdINorge: fastOppholdValues,
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
                            legend={intl.formatMessage({ id: 'radio.fastOpphold.legend' })}
                            feil={formik.errors.status}
                        >
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.ja' })}
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårOppfylt,
                                    })
                                }
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.nei' })}
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                                onChange={() =>
                                    formik.setValues({
                                        ...formik.values,
                                        status: FastOppholdINorgeStatus.VilkårIkkeOppfylt,
                                    })
                                }
                            />
                            <Radio
                                label={intl.formatMessage({ id: 'radio.label.uavklart' })}
                                name="fastOppholdINorge"
                                checked={formik.values.status === FastOppholdINorgeStatus.Uavklart}
                                onChange={() =>
                                    formik.setValues({ ...formik.values, status: FastOppholdINorgeStatus.Uavklart })
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
                                        handleSave(formik.values, Routes.saksoversiktIndex.createURL());
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel="Fra søknad"
                        fakta={createFaktaBlokkArray(props.behandling.søknad.søknadInnhold, intl)}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default FastOppholdINorge;
