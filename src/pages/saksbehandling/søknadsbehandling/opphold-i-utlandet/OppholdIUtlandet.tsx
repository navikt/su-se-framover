import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import { UtenlandsOppholdFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~context/søknadsbehandlingDraftContext';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import { OppholdIUtlandetStatus } from '~types/Behandlingsinformasjon';
import { Vilkårtype } from '~types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './oppholdIUtlandet-nb';

interface FormData {
    status: Nullable<OppholdIUtlandetStatus>;
    begrunnelse: Nullable<string>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                Object.values(OppholdIUtlandetStatus),
                'Du må velge om søker har planlagt å oppholde seg for lenge i utlandet'
            ),
        begrunnelse: yup.string().defined(),
    })
    .required();

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const [lagreUtenlandsoppholdStatus, lagreUtenlandsopphold] = useAsyncActionCreator(sakSlice.lagreUtenlandsopphold);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const initialValues = {
        status: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.status ?? null,
        begrunnelse: props.behandling.behandlingsinformasjon.oppholdIUtlandet?.begrunnelse ?? null,
    };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.OppholdIUtlandet,
        (values) => eqFormData.equals(values, initialValues)
    );

    const {
        formState: { isValid, isSubmitted, errors },
        ...form
    } = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = (nesteUrl: string) => async (values: FormData) => {
        if (!values.status) return;

        if (eqFormData.equals(values, initialValues)) {
            clearDraft();
            history.push(nesteUrl);
            return;
        }

        await lagreUtenlandsopphold(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                status: values.status,
                begrunnelse: values.begrunnelse,
            },
            () => {
                clearDraft();
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
                                <RadioGroup
                                    legend={formatMessage('radio.oppholdIUtland.legend')}
                                    error={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                    onChange={field.onChange}
                                    name={field.name}
                                    value={field.value ?? undefined}
                                >
                                    <Radio
                                        id={field.name}
                                        ref={field.ref}
                                        value={OppholdIUtlandetStatus.SkalVæreMerEnn90DagerIUtlandet}
                                    >
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={OppholdIUtlandetStatus.SkalHoldeSegINorge}>
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio value={OppholdIUtlandetStatus.Uavklart}>
                                        {formatMessage('radio.label.uavklart')}
                                    </Radio>
                                </RadioGroup>
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
                                        error={fieldState.error?.message}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                        </div>
                        {pipe(
                            lagreUtenlandsoppholdStatus,
                            RemoteData.fold(
                                () => null,
                                () => <Loader title={formatMessage('display.lagre.lagrer')} />,
                                (err) => <ApiErrorAlert error={err} />,
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                        />
                    </form>
                ),
                right: <UtenlandsOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
