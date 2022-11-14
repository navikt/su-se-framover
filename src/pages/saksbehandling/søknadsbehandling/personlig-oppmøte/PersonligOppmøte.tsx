import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Heading } from '@navikt/ds-react';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvForNav from '~src/components/oppsummeringAvSøknadinnhold/OppsummeringAvForNav';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import PersonligOppmøteForm from '~src/components/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteForm';
import {
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormDataTilRequest,
    eqPersonligOppmøteVilkårFormData,
    personligOppmøteFormSchema,
    personligOppmøteVilkårTilFormDataEllerNy,
} from '~src/components/vilkårOgGrunnlagForms/personligOppmøte/PersonligOppmøteFormUtils';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagrePersonligOppmøteVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { erNoenVurdertUavklart } from '~src/pages/saksbehandling/utils';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Sakstype } from '~src/types/Sak';
import { Søknadsbehandling, SøknadsbehandlingStatus } from '~src/types/Søknadsbehandling';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';
import { mapToVilkårsinformasjon } from '~src/utils/søknadsbehandling/vilkår/vilkårUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './personligOppmøte-nb';
import * as styles from './personligOppmøte.module.less';

const PersonligOppmøte = (props: VilkårsvurderingBaseProps & { sakstype: Sakstype }) => {
    const navigate = useNavigate();
    const advarselRef = useRef<HTMLDivElement>(null);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);

    const initialValues = personligOppmøteVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.personligOppmøte,
        props.behandling.stønadsperiode?.periode
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<PersonligOppmøteVilkårFormData>(Vilkårtype.PersonligOppmøte, (values) =>
            eqPersonligOppmøteVilkårFormData.equals(values, initialValues)
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
            }
        );
    };

    const onSuccess = (res: Søknadsbehandling) => {
        if (erNoenVilkårVurdertUavklart(res.grunnlagsdataOgVilkårsvurderinger)) {
            advarselRef.current?.focus();
            return;
        }
        res.status === SøknadsbehandlingStatus.VILKÅRSVURDERT_AVSLAG
            ? navigate(
                  Routes.saksbehandlingSendTilAttestering.createURL({
                      sakId: props.sakId,
                      behandlingId: props.behandling.id,
                  })
              )
            : navigate(props.nesteUrl);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <PersonligOppmøteForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        onFormSubmit={(values) => save(values, onSuccess)}
                        savingState={status}
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
                    <>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvForNav forNav={props.behandling.søknad.søknadInnhold.forNav} />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default PersonligOppmøte;
