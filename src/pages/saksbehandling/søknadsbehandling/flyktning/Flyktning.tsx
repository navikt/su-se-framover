import { yupResolver } from '@hookform/resolvers/yup';
import { Alert } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import { FlyktningFaktablokk } from '~src/components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FlyktningFaktablokk';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FlyktningForm from '~src/components/vilkårForms/flyktning/FlyktningForm';
import {
    FlyktningVilkårFormData,
    flyktningFormSchema,
    flyktningVilkårTilFlyktningVilkårFormData,
    nyVurderingsperiodeFlyktningMedEllerUtenPeriode,
    eqFlyktningVilkårFormData,
} from '~src/components/vilkårForms/flyktning/FlyktningFormUtils';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknad';
import { Søknadsbehandling } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './flyktning-nb';
import * as styles from './flyktning.module.less';

const Flyktning = (props: VilkårsvurderingBaseProps & { søknadInnhold: SøknadInnholdUføre }) => {
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagreFlyktningVilkår] = useAsyncActionCreator(sakSlice.lagreFlyktningVilkår);

    const initialValues = props.behandling.grunnlagsdataOgVilkårsvurderinger.flyktning
        ? flyktningVilkårTilFlyktningVilkårFormData(props.behandling.grunnlagsdataOgVilkårsvurderinger.flyktning)
        : { flyktning: [nyVurderingsperiodeFlyktningMedEllerUtenPeriode(props.behandling.stønadsperiode?.periode)] };

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FlyktningVilkårFormData>(
        Vilkårtype.Flyktning,
        (values) => eqFlyktningVilkårFormData.equals(values, initialValues)
    );

    const form = useForm<FlyktningVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(flyktningFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const vilGiTidligAvslag =
        props.behandling.grunnlagsdataOgVilkårsvurderinger.uføre?.resultat === UføreResultat.VilkårIkkeOppfylt ||
        form.watch('flyktning')?.some((vurdering) => vurdering.resultat === Vilkårstatus.VilkårIkkeOppfylt);

    const vedtakUrl = Routes.saksbehandlingSendTilAttestering.createURL({
        sakId: props.sakId,
        behandlingId: props.behandling.id,
    });

    const save = (values: FlyktningVilkårFormData, onSuccess: (behandling: Søknadsbehandling) => void) => {
        lagreFlyktningVilkår(
            {
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                vurderinger: values.flyktning.map((v) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
                    },
                    vurdering: v.resultat!,
                })),
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling);
            }
        );
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FlyktningForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={vilGiTidligAvslag ? vedtakUrl : props.nesteUrl}
                        avsluttUrl={props.avsluttUrl}
                        onFormSubmit={save}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        nesteknappTekst={vilGiTidligAvslag ? formatMessage('knapp.tilVedtaket') : undefined}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                    >
                        {vilGiTidligAvslag && (
                            <Alert className={styles.avslagAdvarsel} variant="info">
                                {formatMessage('display.avslag.advarsel')}
                            </Alert>
                        )}
                    </FlyktningForm>
                ),
                right: <FlyktningFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Flyktning;
