import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { FlyktningFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { SøknadsbehandlingWrapper } from '~src/pages/saksbehandling/søknadsbehandling/SøknadsbehandlingWrapper';
import { Behandling, Behandlingsstatus } from '~src/types/Behandling';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';

import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './flyktning-nb';
import * as styles from './flyktning.module.less';

interface FormData {
    status: Nullable<Vilkårstatus>;
}

const schema = yup
    .object<FormData>({
        status: yup
            .mixed()
            .defined()
            .oneOf(
                [Vilkårstatus.VilkårOppfylt, Vilkårstatus.VilkårIkkeOppfylt, Vilkårstatus.Uavklart],
                'Du må velge om vilkåret er oppfylt'
            ),
    })
    .required();

const Flyktning = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreBehandlingsinformasjon] = useAsyncActionCreator(sakSlice.lagreBehandlingsinformasjon);

    const initialValues: FormData = { status: props.behandling.behandlingsinformasjon.flyktning?.status ?? null };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormData>(
        Vilkårtype.Flyktning,
        (values) => values.status === initialValues.status
    );

    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandling.id,
    });

    const saksoversiktUrl = Routes.saksoversiktValgtSak.createURL({
        sakId: props.sakId,
    });

    const save = (values: FormData, onSuccess: (behandling: Behandling) => void) => {
        lagreBehandlingsinformasjon(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    flyktning: {
                        status: values.status!,
                    },
                },
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling);
            }
        );
    };

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(schema),
    });

    useDraftFormSubscribe(form.watch);

    const vilGiTidligAvslag =
        props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
        form.watch('status') === Vilkårstatus.VilkårIkkeOppfylt;

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <SøknadsbehandlingWrapper
                        form={form}
                        save={(values, onSuccess) => save(values, onSuccess)}
                        savingState={status}
                        avsluttUrl={saksoversiktUrl}
                        onSuccess={(behandling) =>
                            navigate(
                                behandling.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
                                    ? vedtakUrl
                                    : props.nesteUrl
                            )
                        }
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <div className={sharedStyles.containerElement}>
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        legend={formatMessage('radio.flyktning.legend')}
                                        error={fieldState.error?.message}
                                        onBlur={field.onBlur}
                                        onChange={field.onChange}
                                        value={field.value ?? ''}
                                    >
                                        <Radio
                                            id={field.name}
                                            name={field.name}
                                            value={Vilkårstatus.VilkårOppfylt}
                                            ref={field.ref}
                                        >
                                            {formatMessage('radio.label.ja')}
                                        </Radio>
                                        <Radio
                                            name={field.name}
                                            onChange={() => field.onChange(Vilkårstatus.VilkårIkkeOppfylt)}
                                            value={Vilkårstatus.VilkårIkkeOppfylt}
                                        >
                                            {formatMessage('radio.label.nei')}
                                        </Radio>
                                        <Radio
                                            name={field.name}
                                            onChange={() => field.onChange(Vilkårstatus.Uavklart)}
                                            value={Vilkårstatus.Uavklart}
                                        >
                                            {formatMessage('radio.label.uavklart')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />

                            {vilGiTidligAvslag && (
                                <Alert className={styles.avslagAdvarsel} variant="info">
                                    {formatMessage('display.avslag.advarsel')}
                                </Alert>
                            )}
                        </div>
                    </SøknadsbehandlingWrapper>
                ),
                right: <FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Flyktning;
