import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';

import { FeatureToggle } from '~src/api/featureToggleApi';
import { Behandlingstype, VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import * as personApi from '~src/api/personApi';
import OppsummeringAvSkattegrunnlag from '~src/components/oppsummeringAvSkattegrunnlag/OppsummeringAvSkattegrunnlag';
import OppsummeringAvFormue from '~src/components/oppsummeringAvSøknadinnhold/OppsummeringAvFormue';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import BosituasjonFormIntegrertMedFormue from '~src/components/vilkårOgGrunnlagForms/bosituasjon/BosituasjonFormIntegrertMedFormue';
import FormueForm from '~src/components/vilkårOgGrunnlagForms/formue/FormueForm';
import {
    FormueVilkårFormData,
    FormueVilkårOgDelvisBosituasjonFormData,
    FormueFormDataer,
    formueFormSchema,
    getInitialFormueVilkårOgDelvisBosituasjon,
    formueVilkårFormTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { ApiResult, useApiCall, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import {
    BosituasjonTyper,
    UfullstendigBosituasjon,
} from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import { SkattegrunnlagKategori } from '~src/types/skatt/Skatt';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';

import messages from './formue-nb';

const Formue = (props: VilkårsvurderingBaseProps & { søker: personApi.Person }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [lagreFormueStatus, lagreFormue] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreFormuegrunnlag);
    const [lagreEpsGrunnlagStatus, lagreEpsGrunnlag] = useAsyncActionCreator(
        GrunnlagOgVilkårActions.lagreUfullstendigBosituasjon
    );
    const skattemeldingToggle = useFeatureToggle(FeatureToggle.Skattemelding);
    const combinedLagringsstatus = RemoteData.combine(lagreFormueStatus, lagreEpsGrunnlagStatus);
    const [eps, fetchEps, resetEpsToInitial] = useApiCall(personApi.fetchPerson);

    const initialValues = getInitialFormueVilkårOgDelvisBosituasjon(
        props.behandling.søknad.søknadInnhold,
        props.behandling.grunnlagsdataOgVilkårsvurderinger,
        lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<FormueVilkårOgDelvisBosituasjonFormData>(
            Vilkårtype.Formue,
            () => props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.resultat === null
        );

    const form = useForm<FormueVilkårOgDelvisBosituasjonFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(formueFormSchema),
    });

    const watch = form.watch();

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: FormueVilkårOgDelvisBosituasjonFormData, onSuccess: () => void) => {
        if (RemoteData.isPending(eps) && values.epsFnr !== null) return;

        await lagreEpsGrunnlag(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                epsFnr: values.epsFnr,
            },
            () =>
                lagreFormue(
                    {
                        ...formueVilkårFormTilRequest(props.sakId, props.behandling.id, values as FormueVilkårFormData),
                        behandlingstype: Behandlingstype.Søknadsbehandling,
                    },
                    () => {
                        clearDraft();
                        onSuccess();
                    }
                )
        );
    };

    const formDataTilMidlertidigKonstruertBosituasjon = (
        values: FormueVilkårOgDelvisBosituasjonFormData
    ): UfullstendigBosituasjon =>
        ({
            sats: null,
            type: values.borSøkerMedEPS
                ? BosituasjonTyper.UFULLSTENDIG_HAR_EPS
                : BosituasjonTyper.UFULLSTENDIG_HAR_IKKE_EPS,
            periode: props.behandling.stønadsperiode!.periode,
            fnr: values.borSøkerMedEPS ? watch.epsFnr : null,
            delerBolig: null,
            ektemakeEllerSamboerUførFlyktning: null,
        } as UfullstendigBosituasjon);

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <div>
                        <BosituasjonFormIntegrertMedFormue
                            sakId={props.sakId}
                            søknadsbehandlingId={props.behandling.id}
                            søker={props.søker}
                            søknadInnhold={props.behandling.søknad.søknadInnhold}
                            form={form}
                            eps={eps}
                            fetchEps={fetchEps}
                            resetEpsToInitial={resetEpsToInitial}
                        />
                        <FormueForm
                            form={form as unknown as UseFormReturn<FormueVilkårFormData>}
                            minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                            neste={{
                                onClick: handleSave as (
                                    values: FormueFormDataer,
                                    onSuccess: () => void
                                ) => Promise<void>,
                                url: props.nesteUrl,
                                savingState: pipe(
                                    combinedLagringsstatus,
                                    RemoteData.fold3(
                                        () => RemoteData.pending,
                                        (err) => RemoteData.failure(err),
                                        (res) => RemoteData.success(res)
                                    )
                                ) as ApiResult<VilkårOgGrunnlagApiResult>,
                            }}
                            fortsettSenere={{
                                url: props.avsluttUrl,
                            }}
                            tilbake={{
                                url: props.forrigeUrl,
                            }}
                            søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                            begrensTilEnPeriode
                            skalIkkeKunneVelgePeriode
                            formuegrenser={props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser}
                            bosituasjonsgrunnlag={[formDataTilMidlertidigKonstruertBosituasjon(form.getValues())]}
                            {...props}
                        />
                    </div>
                ),
                right: (
                    <div>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvFormue
                            formue={{
                                søkers: props.behandling.søknad.søknadInnhold.formue,
                                eps: props.behandling.søknad.søknadInnhold.ektefelle?.formue,
                            }}
                        />
                        {skattemeldingToggle && (
                            <OppsummeringAvSkattegrunnlag
                                kategori={SkattegrunnlagKategori.FORMUE}
                                søkerFnr={props.søker.fnr}
                                skalHenteSkattegrunnlagForEPS={watch.epsFnr?.length === 11 ? watch.epsFnr : null}
                            />
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Formue;
