import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { InformationFilled } from '@navikt/ds-icons';
import { Alert, BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/bunnknapper/Navigasjonsknapper';
import { InformasjonsRevurdering, TilbakekrevingsAvgjørelse } from '~src/types/Revurdering';
import { erRevurderingTilbakekrevingsbehandling } from '~src/utils/revurdering/revurderingUtils';

import messages from './tilbakekrevingForm-nb';
import * as styles from './tilbakekrevingForm.module.less';

export type TilbakekrevingsbehandlingFormData = {
    avgjørelse: TilbakekrevingsAvgjørelse;
};

export const TilbakekrevingForm = (props: {
    forrige: { url: string; visModal: boolean };
    revurdering: InformasjonsRevurdering;
    sakId: string;
}) => {
    const [lagreTilbakekrevingsbehandlingState, lagreTilbakekrevingsbehandling] =
        useAsyncActionCreatorWithArgsTransformer(
            RevurderingActions.lagreTilbakekrevingsbehandling,
            (behandling: TilbakekrevingsbehandlingFormData) => ({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                tilbakekrevingsbehandling: behandling,
            })
        );

    const { formatMessage } = useI18n({ messages });

    const form = useForm<TilbakekrevingsbehandlingFormData>({
        defaultValues: {
            avgjørelse: erRevurderingTilbakekrevingsbehandling(props.revurdering)
                ? props.revurdering.tilbakekrevingsbehandling?.avgjørelse
                : TilbakekrevingsAvgjørelse.IKKE_AVGJORT,
        },
        resolver: yupResolver(
            yup
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
                .required()
        ),
    });

    return (
        <>
            <form onSubmit={form.handleSubmit(lagreTilbakekrevingsbehandling)} className={styles.form}>
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
                            <Radio id={field.name} ref={field.ref} value={TilbakekrevingsAvgjørelse.TILBAKEKREV}>
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
                {RemoteData.isFailure(lagreTilbakekrevingsbehandlingState) && (
                    <ApiErrorAlert error={lagreTilbakekrevingsbehandlingState.error} />
                )}

                <Navigasjonsknapper
                    nesteKnappTekst={formatMessage('neste')}
                    tilbake={props.forrige}
                    loading={RemoteData.isPending(lagreTilbakekrevingsbehandlingState)}
                />
            </form>
        </>
    );
};
