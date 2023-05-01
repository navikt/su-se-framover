import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { Behandlingstype, VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import FormueForm from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueForm';
import {
    FormueVilkårFormData,
    formueFormSchema,
    getInitialFormueVilkårOgDelvisBosituasjon,
    formueVilkårFormTilRequest,
} from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import HentOgVisSkattegrunnlag from '~src/components/hentOgVisSkattegrunnlag/HentOgVisSkattegrunnlag';
import OppsummeringAvFormue from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvFormue';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Person } from '~src/types/Person';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { erSøknadsbehandlingOpprettet, erSøknadsbehandlingVilkårsvurdert } from '~src/utils/SøknadsbehandlingUtils';

import sharedI18n from '../sharedI18n-nb';

import messages from './formue-nb';
import styles from './Formue.module.less';

const Formue = (props: VilkårsvurderingBaseProps & { søker: Person }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [lagreFormueStatus, lagreFormue] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreFormuegrunnlag);
    const skattemeldingToggle = useFeatureToggle(FeatureToggle.Skattemelding);

    const initialValues = getInitialFormueVilkårOgDelvisBosituasjon(
        props.behandling.søknad.søknadInnhold,
        props.behandling.grunnlagsdataOgVilkårsvurderinger,
        lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormueVilkårFormData>(
        Vilkårtype.Formue,
        () => props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.resultat === null
    );

    const form = useForm<FormueVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(formueFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: FormueVilkårFormData, onSuccess: () => void) => {
        await lagreFormue(
            {
                ...formueVilkårFormTilRequest(props.sakId, props.behandling.id, values as FormueVilkårFormData),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            () => {
                clearDraft();
                onSuccess();
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FormueForm
                        form={form as unknown as UseFormReturn<FormueVilkårFormData>}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: handleSave as (
                                values: FormueVilkårFormData,
                                onSuccess: () => void
                            ) => Promise<void>,
                            url: props.nesteUrl,
                            savingState: pipe(
                                lagreFormueStatus,
                                RemoteData.fold(
                                    () => RemoteData.initial,
                                    () => RemoteData.pending,
                                    (err) => RemoteData.failure(err),
                                    (res) => RemoteData.success(res)
                                )
                            ) as ApiResult<VilkårOgGrunnlagApiResult>,
                        }}
                        lagreOgfortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        formuegrenser={props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser}
                        bosituasjonsgrunnlag={props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        {...props}
                    />
                ),
                right: (
                    <div className={styles.rightContainer}>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvFormue
                            formue={{
                                søkers: props.behandling.søknad.søknadInnhold.formue,
                                eps: props.behandling.søknad.søknadInnhold.ektefelle?.formue,
                            }}
                        />
                        {skattemeldingToggle && (
                            <HentOgVisSkattegrunnlag
                                sakId={props.behandling.sakId}
                                behandlingId={props.behandling.id}
                                //henter bare ny hvis tilstanden er opprettet / vilkårsvurdert
                                hentBareEksisterende={
                                    !(
                                        erSøknadsbehandlingOpprettet(props.behandling) ||
                                        erSøknadsbehandlingVilkårsvurdert(props.behandling)
                                    )
                                }
                                harSkattegrunnlag={props.behandling.harSkattegrunnlag}
                            />
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Formue;
