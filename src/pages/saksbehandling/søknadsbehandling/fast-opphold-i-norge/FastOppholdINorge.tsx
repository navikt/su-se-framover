import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eq } from 'fp-ts/lib/Eq';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { FastOppholdFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FastOppholdFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { FastOppholdINorge as FastOppholdINorgeType, FastOppholdINorgeStatus } from '~types/Behandlingsinformasjon';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './fastOppholdINorge-nb';

interface FormData {
    status: Nullable<FastOppholdINorgeStatus>;
    begrunnelse: Nullable<string>;
}

const eqFastOppholdINorge: Eq<Nullable<FastOppholdINorgeType>> = {
    equals: (fastOpphold1, fastOpphold2) =>
        fastOpphold1?.status === fastOpphold2?.status && fastOpphold1?.begrunnelse === fastOpphold2?.begrunnelse,
};

const schema = yup.object<FormData>({
    status: yup
        .mixed<FastOppholdINorgeStatus>()
        .defined()
        .oneOf(Object.values(FastOppholdINorgeStatus), 'Du må velge om søker oppholder seg fast i norge'),
    begrunnelse: yup.string().defined(),
});

const FastOppholdINorge = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const history = useHistory();

    const handleSave = (nesteUrl: string) => (values: FormData) => {
        if (!values.status) return;

        const fastOppholdValues: FastOppholdINorgeType = {
            status: values.status,
            begrunnelse: values.begrunnelse,
        };

        if (eqFastOppholdINorge.equals(fastOppholdValues, props.behandling.behandlingsinformasjon.fastOppholdINorge)) {
            history.push(nesteUrl);
            return;
        }

        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    fastOppholdINorge: fastOppholdValues,
                },
            },
            () => {
                history.push(nesteUrl);
            }
        );
    };

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: {
            status: props.behandling.behandlingsinformasjon.fastOppholdINorge?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.fastOppholdINorge?.begrunnelse ?? null,
        },
        resolver: yupResolver(schema),
    });

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={form.handleSubmit(handleSave(props.nesteUrl), focusAfterTimeout(feiloppsummeringRef))}
                    >
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field, fieldState }) => (
                                <RadioGruppe
                                    legend={formatMessage('radio.fastOpphold.legend')}
                                    feil={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                >
                                    <Radio
                                        id={field.name}
                                        label={formatMessage('radio.label.ja')}
                                        name="fastOppholdINorge"
                                        checked={field.value === FastOppholdINorgeStatus.VilkårOppfylt}
                                        onChange={() => field.onChange(FastOppholdINorgeStatus.VilkårOppfylt)}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.nei')}
                                        name="fastOppholdINorge"
                                        checked={field.value === FastOppholdINorgeStatus.VilkårIkkeOppfylt}
                                        onChange={() => field.onChange(FastOppholdINorgeStatus.VilkårIkkeOppfylt)}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.uavklart')}
                                        name="fastOppholdINorge"
                                        checked={field.value === FastOppholdINorgeStatus.Uavklart}
                                        onChange={() => field.onChange(FastOppholdINorgeStatus.Uavklart)}
                                    />
                                </RadioGruppe>
                            )}
                        />
                        <div className={sharedStyles.textareaContainer}>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label={formatMessage('input.label.begrunnelse')}
                                        {...field}
                                        feil={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                        </div>
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                () => (
                                    <AlertStripe type="feil">
                                        {formatMessage('display.lagre.lagringFeilet')}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            innerRef={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                form.handleSubmit(
                                    handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                    focusAfterTimeout(feiloppsummeringRef)
                                );
                            }}
                        />
                    </form>
                ),
                right: <FastOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default FastOppholdINorge;
