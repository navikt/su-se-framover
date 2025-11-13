import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import { UseFormReturn, useForm } from 'react-hook-form';

import { Behandlingstype, VilkårOgGrunnlagApiResult } from '~src/api/GrunnlagOgVilkårApi';
import SkattForm from '~src/components/forms/eksternegrunnlag/skatt/SkattForm';
import FormueForm from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueForm';
import {
    eqFormueVilkårFormData,
    FormueVilkårFormData,
    formueFormSchema,
    formueVilkårFormTilRequest,
    getInitialFormueVilkårOgDelvisBosituasjon,
} from '~src/components/forms/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import OppsummeringAvEksternGrunnlagSkatt from '~src/components/oppsummering/oppsummeringAvEksternGrunnlag/OppsummeringAvEksternGrunnlagSkatt';
import OppsummeringAvFormue from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvFormue';
import OppsummeringAvFormueVilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as GrunnlagOgVilkårActions from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { hentNySkattegrunnlag } from '~src/features/SøknadsbehandlingActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { VilkårsvurderingBaseProps } from '~src/pages/saksbehandling/søknadsbehandling/types';
import { Person } from '~src/types/Person';
import { EksisterendeVedtaksinformasjonTidligerePeriodeResponse } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import styles from './Formue.module.less';
import messages from './formue-nb';

const Formue = (
    props: VilkårsvurderingBaseProps & {
        søker: Person;
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [lagreFormueStatus, lagreFormue] = useAsyncActionCreator(GrunnlagOgVilkårActions.lagreFormuegrunnlag);
    const [nyStatus, ny] = useAsyncActionCreator(hentNySkattegrunnlag);

    const initialValues = getInitialFormueVilkårOgDelvisBosituasjon(
        props.behandling.søknad.søknadInnhold,
        props.behandling.grunnlagsdataOgVilkårsvurderinger,
        lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode),
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FormueVilkårFormData>(
        Vilkårtype.Formue,
        (values) => eqFormueVilkårFormData.equals(values, initialValues),
    );

    const form = useForm<FormueVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(formueFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const handleSave = async (values: FormueVilkårFormData, onSuccess: () => void) => {
        /*
        Fordi vi pre-utfyller ved formue, har vi ikke en god sjekk på at saksbehandler
        faktisk ikke vil endre på noen felter. Det vil si at hvis pre-utfyllingen er riktig, så vil vi 
        uansett sende verdiene til backend. 
        */
        await lagreFormue(
            {
                ...formueVilkårFormTilRequest(props.sakId, props.behandling.id, values as FormueVilkårFormData),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            () => {
                clearDraft();
                onSuccess();
            },
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
                                onSuccess: () => void,
                            ) => Promise<void>,
                            url: props.nesteUrl,
                            savingState: pipe(
                                lagreFormueStatus,
                                RemoteData.fold(
                                    () => RemoteData.initial,
                                    () => RemoteData.pending,
                                    (err) => RemoteData.failure(err),
                                    (res) => RemoteData.success(res),
                                ),
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

                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvFormueVilkår formue={data.grunnlagsdataOgVilkårsvurderinger.formue} />
                            )}
                        />

                        <SkattForm
                            medTittel
                            onSøk={{
                                fn: (formValues) =>
                                    ny({
                                        sakId: props.sakId,
                                        behandlingId: props.behandling.id,
                                        fra: formValues.fra,
                                        til: formValues.til,
                                    }),
                                onSøkStatus: nyStatus,
                            }}
                            defaultValues={{
                                fra: props.behandling.eksterneGrunnlag.skatt?.søkers.årSpurtFor.fra.toString(),
                                til: props.behandling.eksterneGrunnlag.skatt?.søkers.årSpurtFor.til.toString(),
                            }}
                        />
                        {props.behandling.eksterneGrunnlag.skatt && (
                            <OppsummeringAvEksternGrunnlagSkatt
                                eksternGrunnlagSkatt={props.behandling.eksterneGrunnlag.skatt}
                            />
                        )}
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Formue;
