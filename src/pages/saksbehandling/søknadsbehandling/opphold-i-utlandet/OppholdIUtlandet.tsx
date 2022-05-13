import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as S from 'fp-ts/string';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import { UtenlandsOppholdFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/UtenlandsOppholdFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~src/lib/formUtils';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Utenlandsoppholdstatus } from '~src/types/grunnlagsdataOgVilkårsvurderinger/utenlandsopphold/Utenlandsopphold';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { sluttenAvMåneden, toIsoDateOnlyString } from '~src/utils/date/dateUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurderingknapper';

import messages from './oppholdIUtlandet-nb';

interface FormData {
    status: Nullable<Utenlandsoppholdstatus>;
}

const eqFormData = struct<FormData>({
    status: eqNullable(S.Eq),
});

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                Object.values(Utenlandsoppholdstatus),
                'Du må velge om søker har planlagt å oppholde seg for lenge i utlandet'
            ),
    })
    .required();

const OppholdIUtlandet = (props: VilkårsvurderingBaseProps) => {
    const navigate = useNavigate();
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreUtenlandsopphold] = useAsyncActionCreator(sakSlice.lagreUtenlandsopphold);
    const initialValues = {
        status: props.behandling.grunnlagsdataOgVilkårsvurderinger.utenlandsopphold?.vurderinger[0]?.status ?? null,
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
            navigate(nesteUrl);
            return;
        }

        await lagreUtenlandsopphold(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                status: values.status,
                periode: {
                    fraOgMed: props.behandling.stønadsperiode?.periode.fraOgMed ?? toIsoDateOnlyString(new Date()),
                    tilOgMed:
                        props.behandling.stønadsperiode?.periode.tilOgMed ??
                        toIsoDateOnlyString(sluttenAvMåneden(new Date())),
                },
            },
            () => {
                clearDraft();
                navigate(nesteUrl);
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
                                    value={field.value ?? ''}
                                >
                                    <Radio
                                        id={field.name}
                                        ref={field.ref}
                                        value={Utenlandsoppholdstatus.SkalVæreMerEnn90DagerIUtlandet}
                                    >
                                        {formatMessage('radio.label.ja')}
                                    </Radio>
                                    <Radio value={Utenlandsoppholdstatus.SkalHoldeSegINorge}>
                                        {formatMessage('radio.label.nei')}
                                    </Radio>
                                    <Radio value={Utenlandsoppholdstatus.Uavklart}>
                                        {formatMessage('radio.label.uavklart')}
                                    </Radio>
                                </RadioGroup>
                            )}
                        />
                        {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
                            hidden={!isSubmitted || isValid}
                            feil={hookFormErrorsTilFeiloppsummering(errors)}
                            ref={feiloppsummeringRef}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                navigate(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                            loading={RemoteData.isPending(status)}
                        />
                    </form>
                ),
                right: <UtenlandsOppholdFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default OppholdIUtlandet;
