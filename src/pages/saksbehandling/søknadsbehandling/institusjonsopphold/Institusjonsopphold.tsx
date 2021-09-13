import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Eq } from 'fp-ts/lib/Eq';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { InstitusjonsoppholdBlokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/InstitusjonsoppholdBlokk';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { focusAfterTimeout } from '~lib/formUtils';
import { pipe } from '~lib/fp';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { hookFormErrorsTilFeiloppsummering } from '~lib/validering';
import {
    InstitusjonsoppholdStatus,
    Institusjonsopphold as InstitusjonsoppholdType,
} from '~types/Behandlingsinformasjon';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './institusjonsopphold-nb';

interface InstitusjonsoppholdFormData {
    status: Nullable<InstitusjonsoppholdStatus>;
    begrunnelse: Nullable<string>;
}

const eqInstitusjonsopphold: Eq<Nullable<InstitusjonsoppholdType>> = {
    equals: (institusjonsopphold1, institusjonsopphold2) =>
        institusjonsopphold1?.status === institusjonsopphold2?.status &&
        institusjonsopphold1?.begrunnelse === institusjonsopphold2?.begrunnelse,
};

const schema = yup.object<InstitusjonsoppholdFormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf(Object.values(InstitusjonsoppholdStatus), 'Du må velge om institusjonsoppholdet skal føre til avslag'),
    begrunnelse: yup.string().defined(),
});

const Institusjonsopphold = (props: VilkårsvurderingBaseProps) => {
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
            status: props.behandling.behandlingsinformasjon.institusjonsopphold?.status ?? null,
            begrunnelse: props.behandling.behandlingsinformasjon.institusjonsopphold?.begrunnelse ?? null,
        },
        resolver: yupResolver(schema),
    });

    const handleSave = (nesteUrl: string) => async (values: InstitusjonsoppholdFormData) => {
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

        await lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    institusjonsopphold: institusjonsValues,
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
                                    legend={formatMessage('radio.institusjonsoppholdFørerTilAvslag.legend')}
                                    feil={fieldState.error?.message}
                                    onBlur={field.onBlur}
                                >
                                    <Radio
                                        id={field.name}
                                        label={formatMessage('radio.label.ja')}
                                        name={field.name}
                                        checked={field.value === InstitusjonsoppholdStatus.VilkårIkkeOppfylt}
                                        onChange={() => field.onChange(InstitusjonsoppholdStatus.VilkårIkkeOppfylt)}
                                        radioRef={field.ref}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.nei')}
                                        name={field.name}
                                        checked={field.value === InstitusjonsoppholdStatus.VilkårOppfylt}
                                        onChange={() => field.onChange(InstitusjonsoppholdStatus.VilkårOppfylt)}
                                    />
                                    <Radio
                                        label={formatMessage('radio.label.uavklart')}
                                        name={field.name}
                                        checked={field.value === InstitusjonsoppholdStatus.Uavklart}
                                        onChange={() => field.onChange(InstitusjonsoppholdStatus.Uavklart)}
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
                                (err) => <ApiErrorAlert error={err} />,
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
                            onLagreOgFortsettSenereClick={form.handleSubmit(
                                handleSave(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })),
                                focusAfterTimeout(feiloppsummeringRef)
                            )}
                        />
                    </form>
                ),
                right: <InstitusjonsoppholdBlokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;
