import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype } from '~src/api/GrunnlagOgVilkårApi';
import InstitusjonsoppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdForm';
import {
    eqInstitusjonsoppholdFormData,
    InstitusjonsoppholdVilkårFormData,
    institusjonsoppholdVilkårTilFormDataEllerNy,
    institusjonsoppholdFormDataTilRequest,
    institusjonsoppholdFormSchema,
} from '~src/components/forms/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdFormUtils';
import OppsummeringAvInnlagtPåInstitusjon from '~src/components/oppsummering/oppsummeringAvSøknadinnhold/OppsummeringAvInnlagtPåInstitusjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useSøknadsbehandlingDraftContextFor } from '~src/context/søknadsbehandlingDraftContext';
import { lagreInstitusjonsoppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Vilkårtype } from '~src/types/Vilkårsvurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';

import messages from './institusjonsopphold-nb';

const Institusjonsopphold = (props: VilkårsvurderingBaseProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [status, lagre] = useAsyncActionCreator(lagreInstitusjonsoppholdVilkår);

    const initialValues = institusjonsoppholdVilkårTilFormDataEllerNy(
        props.behandling.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold,
        props.behandling.stønadsperiode?.periode,
    );

    const { draft, clearDraft, useDraftFormSubscribe } =
        useSøknadsbehandlingDraftContextFor<InstitusjonsoppholdVilkårFormData>(
            Vilkårtype.Institusjonsopphold,
            (values) => eqInstitusjonsoppholdFormData.equals(values, initialValues),
        );

    const form = useForm<InstitusjonsoppholdVilkårFormData>({
        defaultValues: draft ?? initialValues,
        resolver: yupResolver(institusjonsoppholdFormSchema),
    });

    useDraftFormSubscribe(form.watch);

    const save = async (values: InstitusjonsoppholdVilkårFormData, onSuccess: () => void) => {
        await lagre(
            {
                ...institusjonsoppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Søknadsbehandling,
            },
            () => {
                clearDraft();
                onSuccess();
            },
        );
    };

    const handleNesteClick = async (values: InstitusjonsoppholdVilkårFormData, onSuccess: () => void) => {
        if (eqInstitusjonsoppholdFormData.equals(values, initialValues)) {
            navigate(props.nesteUrl);
            return;
        }

        save(values, onSuccess);
    };

    const handleLagreOgFortsettSenereClick = async (
        values: InstitusjonsoppholdVilkårFormData,
        onSuccess: () => void,
    ) => {
        if (eqInstitusjonsoppholdFormData.equals(values, initialValues)) {
            navigate(props.avsluttUrl);
            return;
        }

        save(values, onSuccess);
    };

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <InstitusjonsoppholdForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.behandling.stønadsperiode!.periode)}
                        neste={{
                            onClick: handleNesteClick,
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
                    />
                ),
                right: (
                    <>
                        <Heading size={'small'}>{formatMessage('oppsummering.fraSøknad')}</Heading>
                        <OppsummeringAvInnlagtPåInstitusjon
                            innlagtPåInstitusjon={props.behandling.søknad.søknadInnhold.boforhold.innlagtPåInstitusjon}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;
