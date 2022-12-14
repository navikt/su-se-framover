import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import OppsummeringAvFormueVilkår from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FormueForm from '~src/components/vilkårOgGrunnlagForms/formue/FormueForm';
import {
    FormueVilkårFormData,
    formueVilkårTilFormData,
    formueFormSchema,
    formueVilkårFormTilRequest,
} from '~src/components/vilkårOgGrunnlagForms/formue/FormueFormUtils';
import { lagreFormuegrunnlag } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { InformasjonsRevurdering, RevurderingStegProps } from '~src/types/Revurdering';
import { lagDatePeriodeAvStringPeriode } from '~src/utils/periode/periodeUtils';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

import messages from './formue-nb';
import * as styles from './formue.module.less';

const Formue = (props: RevurderingStegProps) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [lagreFormuegrunnlagStatus, lagreFormuegrunnlagAction] = useAsyncActionCreator(lagreFormuegrunnlag);

    const form = useForm<FormueVilkårFormData>({
        defaultValues: formueVilkårTilFormData(
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue,
            props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon
        ),
        resolver: yupResolver(formueFormSchema),
    });

    const lagreFormuegrunnlaget = (
        data: FormueVilkårFormData,
        onSuccess: (r: InformasjonsRevurdering, nesteUrl: string) => void
    ) => {
        lagreFormuegrunnlagAction(
            {
                ...formueVilkårFormTilRequest(props.sakId, props.revurdering.id, data),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                const castedRes = res as RevurderingOgFeilmeldinger;
                if (castedRes.feilmeldinger.length === 0) {
                    onSuccess(castedRes.revurdering, props.nesteUrl);
                }
            }
        );
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FormueForm
                        form={form}
                        minOgMaxPeriode={lagDatePeriodeAvStringPeriode(props.revurdering.periode)}
                        neste={{
                            onClick: (values) =>
                                lagreFormuegrunnlaget(
                                    values,
                                    props.onSuccessOverride
                                        ? (r) => props.onSuccessOverride!(r)
                                        : () => navigate(props.nesteUrl)
                                ),
                            url: props.nesteUrl,
                            savingState: lagreFormuegrunnlagStatus,
                        }}
                        tilbake={{
                            url: props.onTilbakeClickOverride ? undefined : props.forrigeUrl,
                            onClick: props.onTilbakeClickOverride,
                        }}
                        fortsettSenere={{
                            url: props.avsluttUrl,
                        }}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        formuegrenser={props.revurdering.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser}
                        bosituasjonsgrunnlag={props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        {...props}
                    />
                ),
                right: (
                    <div>
                        <div className={styles.eksisterendeVedtakTittelContainer}>
                            <Heading level="2" size="large">
                                {formatMessage('eksisterende.vedtakinfo.tittel')}
                            </Heading>
                        </div>
                        <OppsummeringAvFormueVilkår formue={props.grunnlagsdataOgVilkårsvurderinger.formue} />
                    </div>
                ),
            }}
        </ToKolonner>
    );
};

export default Formue;
