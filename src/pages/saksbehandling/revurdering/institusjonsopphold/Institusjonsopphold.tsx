import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import InstitusjonsoppholdForm from '~src/components/forms/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdForm';
import {
    InstitusjonsoppholdVilkårFormData,
    institusjonsoppholdFormDataTilRequest,
    institusjonsoppholdFormSchema,
    institusjonsoppholdVilkårTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/institusjonsopphold/InstitusjonsoppholdFormUtils';
import OppsummeringAvInstitusjonsoppholdvilkår from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvInstitusjonsopphold';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreInstitusjonsoppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './institusjonsopphold-nb';

const Institusjonsopphold = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(lagreInstitusjonsoppholdVilkår);

    const initialValues = institusjonsoppholdVilkårTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold,
    );
    const form = useForm<InstitusjonsoppholdVilkårFormData>({
        resolver: yupResolver(institusjonsoppholdFormSchema),
        defaultValues: initialValues,
    });

    const lagreInstitusjonsopphold = (
        values: InstitusjonsoppholdVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        return lagre(
            {
                ...institusjonsoppholdFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    vilkår: values,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                const castedRes = res as RevurderingOgFeilmeldinger;
                if (castedRes.feilmeldinger.length === 0) {
                    onSuccess(castedRes.revurdering, props.nesteUrl);
                }
            },
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <InstitusjonsoppholdForm
                        form={form}
                        minOgMaxPeriode={{
                            fraOgMed: new Date(props.revurdering.periode.fraOgMed),
                            tilOgMed: new Date(props.revurdering.periode.tilOgMed),
                        }}
                        neste={{
                            savingState: status,
                            url: props.nesteUrl,
                            onClick: (values) =>
                                lagreInstitusjonsopphold(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl),
                                ),
                        }}
                        tilbake={{
                            url: props.onTilbakeClickOverride ? undefined : props.forrigeUrl,
                            onClick: props.onTilbakeClickOverride,
                        }}
                        lagreOgfortsettSenere={{
                            onClick: lagreInstitusjonsopphold,
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                        {...props}
                    />
                ),
                right: (
                    <>
                        <Heading size="large" level="2" spacing>
                            {formatMessage('gjeldende.overskrift')}
                        </Heading>
                        <OppsummeringAvInstitusjonsoppholdvilkår
                            institusjonsopphold={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;
