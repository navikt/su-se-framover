import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eq } from 'fp-ts/lib/Eq';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { UtenlandsOppholdFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator, useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { OppholdIUtlandet as OppholdIUtlandetType, OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './oppholdIUtlandet-nb';

interface FormData {
    status: Nullable<OppholdIUtlandetStatus>;
    begrunnelse: Nullable<string>;
}

const eqOppholdIUtlandet: Eq<Nullable<OppholdIUtlandetType>> = {
    equals: (oppholdIUtlandet1, oppholdIUtlandet2) =>
        oppholdIUtlandet1?.status === oppholdIUtlandet2?.status &&
        oppholdIUtlandet1?.begrunnelse === oppholdIUtlandet2?.begrunnelse,
};

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf(
            Object.values(OppholdIUtlandetStatus),
            'Du må velge om søker har planlagt å oppholde seg for lenge i utlandet'
        ),
    begrunnelse: yup.string().defined(),
});

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const [lagreBehandlingsinformasjonStatus, lagreBehandlingsinformasjon] = useAsyncActionCreator(
        sakSlice.lagreBehandlingsinformasjon
    );
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const history = useHistory();

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: {
            status: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
        },
        resolver: yupResolver(schema),
    });

    const handleSave = (nesteUrl: string) => (values: FormData) => {
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

        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    oppholdIUtlandet: oppholdIUtlandetValues,
                },
            },
            () => {
                history.push(nesteUrl);
            }
        );
    };

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
                                    legend={formatMessage('radio.oppholdIUtland.legend')}
                                    feil={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                >
                                    <Radio
                                        id={field.name}
                                        radioRef={field.ref}
                                        label={formatMessage('radio.label.ja')}
                                        name="status"
                                        onChange={() =>
                                            field.onChange(OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet)
                                        }
                                        checked={field.value === OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.nei')}
                                        name="status"
                                        onChange={() => field.onChange(OppholdIUtlandetStatus.SkalHoldeSegINorge)}
                                        checked={field.value === OppholdIUtlandetStatus.SkalHoldeSegINorge}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.uavklart')}
                                        name="status"
                                        onChange={() => field.onChange(OppholdIUtlandetStatus.Uavklart)}
                                        checked={field.value === OppholdIUtlandetStatus.Uavklart}
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
                right: <UtenlandsOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
