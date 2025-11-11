import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import FlyktningForm from '~src/components/forms/vilkårOgGrunnlagForms/flyktning/FlyktningForm';
import {
    eqFlyktningVilkårFormData,
    FlyktningVilkårFormData,
    flyktningFormDataTilRequest,
    flyktningFormSchema,
    flyktningVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/flyktning/FlyktningFormUtils';
import OppsummeringAvFlyktningstatus from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvFlyktningstatus';
import OppsummeringAvFlyktningvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFlyktning';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreFlyktningVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { SøknadInnholdUføre } from '~src/types/Søknadinnhold';
import {
    EksisterendeVedtaksinformasjonTidligerePeriodeResponse,
    Søknadsbehandling,
} from '~src/types/Søknadsbehandling';
import { Vilkårstatus } from '~src/types/Vilkår';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import styles from './flyktning.module.less';
import messages from './flyktning-nb';

const Flyktning = (
    props: VilkårsvurderingBaseProps & {
        søknadInnhold: SøknadInnholdUføre;
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreFlyktningVilkår);

    const initialValues = flyktningVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.flyktning,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } = useSøknadsbehandlingDraftContextFor<FlyktningVilkårFormData>(
        Vilkårtype.Flyktning,
        (values) => eqFlyktningVilkårFormData.equals(values, initialValues),
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
        lagre(
            {
                ...flyktningFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            (behandling) => {
                clearDraft();
                onSuccess(behandling as Søknadsbehandling);
            },
        );
    };

    const handleNesteClick = (values: FlyktningVilkårFormData, onSuccess: (behandling: Søknadsbehandling) => void) => {
        if (eqFlyktningVilkårFormData.equals(initialValues, values)) {
            navigate(props.nesteUrl);
            return;
        }
        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = (
        values: FlyktningVilkårFormData,
        onSuccess: (behandling: Søknadsbehandling) => void,
    ) => {
        if (eqFlyktningVilkårFormData.equals(initialValues, values)) {
            navigate(props.avsluttUrl);
            return;
        }
        save(values, onSuccess);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <FlyktningForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        nesteknappTekst={vilGiTidligAvslag ? formatMessage('knapp.tilVedtaket') : undefined}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        {...props}
                        neste={{
                            onClick: handleNesteClick,
                            savingState: status,
                            url: vilGiTidligAvslag ? vedtakUrl : props.nesteUrl,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleLagreOgFortsettSenereClick,
                            url: props.avsluttUrl,
                        }}
                    >
                        {vilGiTidligAvslag && (
                            <Alert className={styles.avslagAdvarsel} variant="info">
                                {formatMessage('display.avslag.advarsel')}
                            </Alert>
                        )}
                    </FlyktningForm>
                ),
                right: (
                    <div className={sharedStyles.toKollonerRightContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                            <OppsummeringAvFlyktningstatus flyktningstatus={props.søknadInnhold.flyktningsstatus} />
                        </div>
                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvFlyktningvilkår
                                    flyktning={data.grunnlagsdataOgVilkårsvurderinger.flyktning}
                                />
                            )}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Flyktning;
