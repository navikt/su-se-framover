import { yupResolver } from '@hookform/resolvers/yup';
import { InformationFilled } from '@navikt/ds-icons';
import { Heading, BodyLong, RadioGroup, Radio, Alert } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import OppsummeringAvInformasjonsrevurdering from '~src/components/revurdering/oppsummering/OppsummeringAvInformasjonsrevurdering';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import yup from '~src/lib/validering';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { GrunnlagsdataOgVilkårsvurderinger } from '~src/types/grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import {
    InformasjonsRevurdering,
    RevurderingOppsummeringSteg,
    RevurderingSeksjoner,
    TilbakekrevingsAvgjørelse,
} from '~src/types/Revurdering';
import { erRevurderingTilbakekrevingsbehandling } from '~src/utils/revurdering/revurderingUtils';

import messages from './tilbakekrevingForm-nb';
import * as styles from './tilbakekrevingForm.module.less';

export interface TilbakekrevingsbehandlingFormData {
    avgjørelse: TilbakekrevingsAvgjørelse;
}

const tilbakekrevingsSchema = yup
    .object<TilbakekrevingsbehandlingFormData>({
        avgjørelse: yup
            .mixed()
            .required()
            .defined()
            .oneOf(
                [TilbakekrevingsAvgjørelse.TILBAKEKREV, TilbakekrevingsAvgjørelse.IKKE_TILBAKEKREV],
                'Aktsomhet må vurderes ved tilbakekreving'
            ),
    })
    .required();

const TilbakekrevingForm = (props: {
    sakId: string;
    revurdering: InformasjonsRevurdering;
    gjeldendeGrunnlagOgVilkår: GrunnlagsdataOgVilkårsvurderinger;
}) => {
    const { formatMessage } = useI18n({ messages });

    const [lagreTilbakekrevingsbehandlingState, lagreTilbakekrevingsbehandling] = useAsyncActionCreator(
        RevurderingActions.lagreTilbakekrevingsbehandling
    );

    const handleSubmit = (values: TilbakekrevingsbehandlingFormData, onSuccess: () => void) => {
        lagreTilbakekrevingsbehandling(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                tilbakekrevingsbehandling: values,
            },
            () => onSuccess()
        );
    };

    const form = useForm<TilbakekrevingsbehandlingFormData>({
        defaultValues: {
            avgjørelse: erRevurderingTilbakekrevingsbehandling(props.revurdering)
                ? props.revurdering.tilbakekrevingsbehandling?.avgjørelse
                : TilbakekrevingsAvgjørelse.IKKE_AVGJORT,
        },
        resolver: yupResolver(tilbakekrevingsSchema),
    });

    return (
        <ToKolonner tittel={formatMessage('tilbakekreving.tittel')}>
            {{
                left: (
                    <FormWrapper
                        className={styles.stickyDiv}
                        form={form}
                        neste={{
                            savingState: lagreTilbakekrevingsbehandlingState,
                            onClick: handleSubmit,
                            url: Routes.revurderingSeksjonSteg.createURL({
                                sakId: props.sakId,
                                revurderingId: props.revurdering.id,
                                seksjon: RevurderingSeksjoner.Oppsummering,
                                steg: RevurderingOppsummeringSteg.SendTilAttestering,
                            }),
                        }}
                        tilbake={{
                            url: Routes.revurderingSeksjonSteg.createURL({
                                sakId: props.sakId,
                                revurderingId: props.revurdering.id,
                                seksjon: RevurderingSeksjoner.Oppsummering,
                                steg: RevurderingOppsummeringSteg.Forhåndsvarsel,
                            }),
                        }}
                        fortsettSenere={{
                            url: Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                        }}
                    >
                        <div className={styles.form}>
                            <Heading size="small" level="5" spacing className={styles.heading}>
                                {formatMessage('tittel')}
                            </Heading>
                            <div className={styles.undertittel}>
                                <InformationFilled color="#368DA8" width="24px" height="24px" />
                                <BodyLong>{formatMessage('undertittel')}</BodyLong>
                            </div>

                            <Controller
                                control={form.control}
                                name="avgjørelse"
                                render={({ field, fieldState }) => (
                                    <RadioGroup
                                        legend={formatMessage('aktsomhetstittel')}
                                        error={fieldState.error?.message}
                                        {...field}
                                    >
                                        <Radio
                                            id={field.name}
                                            ref={field.ref}
                                            value={TilbakekrevingsAvgjørelse.TILBAKEKREV}
                                        >
                                            {formatMessage('aktsomhetJa')}
                                        </Radio>
                                        <Radio value={TilbakekrevingsAvgjørelse.IKKE_TILBAKEKREV}>
                                            {formatMessage('aktsomhetNei')}
                                        </Radio>
                                    </RadioGroup>
                                )}
                            />
                            {form.watch('avgjørelse') === TilbakekrevingsAvgjørelse.IKKE_TILBAKEKREV && (
                                <Alert variant={'info'}>{formatMessage('ingenTilbakekreving')}</Alert>
                            )}
                        </div>
                    </FormWrapper>
                ),
                right: (
                    <OppsummeringAvInformasjonsrevurdering
                        revurdering={props.revurdering}
                        grunnlagsdataOgVilkårsvurderinger={props.gjeldendeGrunnlagOgVilkår}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default TilbakekrevingForm;
