import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import BosituasjonForm from '~src/components/forms/vilkårOgGrunnlagForms/bosituasjon/BosituasjonForm';
import {
    BosituasjonGrunnlagFormData,
    bosituasjonFormSchema,
    bosituasjongrunnlagFormDataTilRequest,
    bosituasjongrunnlagTilFormDataEllerNy,
} from '~src/components/forms/vilkårOgGrunnlagForms/bosituasjon/BosituasjonFormUtils';
import OppsummeringAvBosituasjongrunnlag from '~src/components/oppsummering/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreBosituasjongrunnlag } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Person } from '~src/types/Person';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import sharedMessages from '../revurdering-nb';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';

const BosituasjonPage = (props: RevurderingStegProps & { søker: Person }) => {
    const navigate = useNavigate();
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjongrunnlag);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const initialValues = bosituasjongrunnlagTilFormDataEllerNy(
        props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon,
        props.revurdering.periode,
    );
    const form = useForm<BosituasjonGrunnlagFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(bosituasjonFormSchema),
    });

    const lagreBosituasjon = (
        data: BosituasjonGrunnlagFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void,
    ) => {
        return lagre(
            {
                ...bosituasjongrunnlagFormDataTilRequest({
                    sakId: props.sakId,
                    behandlingId: props.revurdering.id,
                    data: data,
                }),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
                    onSuccess((res as RevurderingOgFeilmeldinger).revurdering, props.nesteUrl);
                }
            },
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <BosituasjonForm
                        form={form}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.revurdering.periode)}
                        neste={{
                            url: props.nesteUrl,
                            savingState: status,
                            onClick: (values) =>
                                lagreBosituasjon(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl),
                                ),
                        }}
                        tilbake={{ url: props.forrigeUrl }}
                        lagreOgfortsettSenere={{ onClick: lagreBosituasjon, url: props.avsluttUrl }}
                        {...props}
                    >
                        {RemoteData.isSuccess(status) && (
                            <UtfallSomIkkeStøttes
                                feilmeldinger={(status.value as RevurderingOgFeilmeldinger).feilmeldinger}
                            />
                        )}
                    </BosituasjonForm>
                ),
                right: (
                    <>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        <OppsummeringAvBosituasjongrunnlag
                            bosituasjon={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default BosituasjonPage;
