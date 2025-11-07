import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading } from '@navikt/ds-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import PersonligOppmøteForm from '~src/components/forms/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteForm';
import {
    eqPersonligOppmøteVilkårFormData,
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormDataTilRequest,
    personligOppmøteFormSchema,
    personligOppmøteVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteFormUtils';
import OppsummeringAvForNav from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvForNav';
import OppsummeringAvPersonligoppmøtevilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvPersonligOppmøte';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagrePersonligOppmøteVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { ApiResult, useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Sakstype } from '~src/types/Sak';
import {
    EksisterendeVedtaksinformasjonTidligerePeriodeResponse,
    Søknadsbehandling,
    SøknadsbehandlingStatus,
} from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { erNoenVurdertUavklart, mapToVilkårsinformasjon } from '~src/utils/vilkårUtils';

import EksisterendeVedtaksinformasjon from '../EksisterendeVedtaksinformasjon';
import sharedI18n from '../sharedI18n-nb';
import sharedStyles from '../sharedStyles.module.less';
import { VilkårsvurderingBaseProps } from '../types';
import styles from './personligOppmøte.module.less';
import messages from './personligOppmøte-nb';

const PersonligOppmøte = (
    props: VilkårsvurderingBaseProps & {
        sakstype: Sakstype;
        tidligerePeriodeData: ApiResult<EksisterendeVedtaksinformasjonTidligerePeriodeResponse>;
    },
) => {
    const navigate = useNavigate();
    const advarselRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);

    const initialValues = personligOppmøteVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<PersonligOppmøteVilkårFormData>(Vilkårtype.PersonligOppmøte, (values) =>
            eqPersonligOppmøteVilkårFormData.equals(values, initialValues),
        );

    const form = useForm({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(personligOppmøteFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const erNoenVilkårVurdertUavklart = (grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger) => {
        return erNoenVurdertUavklart(mapToVilkårsinformasjon(props.sakstype, grunnlagsdataOgVilkårsvurderinger));
    };

    const save = async (values: PersonligOppmøteVilkårFormData, onSuccess: (res: Søknadsbehandling) => void) => {
        lagre(
            {
                ...personligOppmøteFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            (res) => {
                const oppdatertSøknadsbehandling = res as Søknadsbehandling;
                clearDraft();
                onSuccess(oppdatertSøknadsbehandling);
            },
        );
    };

    const handleNesteClick = async (
        values: PersonligOppmøteVilkårFormData,
        onSuccess: (res: Søknadsbehandling) => void,
    ) => {
        if (eqPersonligOppmøteVilkårFormData.equals(values, initialValues)) {
            if (erNoenVilkårVurdertUavklart(props.behandling.grunnlagsdataOgVilkårsvurderinger)) {
                advarselRef.current?.focus();
                return;
            }

            navigate(props.nesteUrl);
            return;
        }
        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = async (
        values: PersonligOppmøteVilkårFormData,
        onSuccess: (res: Søknadsbehandling) => void,
    ) => {
        if (eqPersonligOppmøteVilkårFormData.equals(values, initialValues)) {
            navigate(props.avsluttUrl);
            return;
        }
        save(values, onSuccess);
    };

    const onSuccess = (res: Søknadsbehandling) => {
        if (erNoenVilkårVurdertUavklart(res.grunnlagsdataOgVilkårsvurderinger)) {
            advarselRef.current?.focus();
            return;
        }
        if (res.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG) {
            navigate(
                Routes.saksbehandlingSendTilAttestering.createURL({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                }),
            );
        } else {
            navigate(props.nesteUrl);
        }
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <PersonligOppmøteForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: (values) => handleNesteClick(values, onSuccess),
                            url: props.nesteUrl,
                            savingState: status,
                        }}
                        tilbake={{
                            url: props.forrigeUrl,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: handleLagreOgFortsettSenereClick,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Søknadsbehandling'}
                        begrensTilEnPeriode
                        skalIkkeKunneVelgePeriode
                        {...props}
                    >
                        <div
                            ref={advarselRef}
                            tabIndex={-1}
                            aria-live="polite"
                            aria-atomic="true"
                            className={styles.alertstripe}
                        >
                            {erNoenVilkårVurdertUavklart(props.behandling.grunnlagsdataOgVilkårsvurderinger) && (
                                <Alert variant="warning">{formatMessage('alert.ikkeFerdigbehandlet')}</Alert>
                            )}
                        </div>
                    </PersonligOppmøteForm>
                ),
                right: (
                    <div className={sharedStyles.toKollonerRightContainer}>
                        <div>
                            <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                            <OppsummeringAvForNav forNav={props.behandling.søknad.søknadInnhold.forNav} />
                        </div>
                        <EksisterendeVedtaksinformasjon
                            eksisterendeVedtaksinformasjon={props.tidligerePeriodeData}
                            onSuccess={(data) => (
                                <OppsummeringAvPersonligoppmøtevilkår
                                    personligoppmøte={data.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                                />
                            )}
                        />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
