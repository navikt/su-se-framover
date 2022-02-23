import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { InformationFilled } from '@navikt/ds-icons';
import { Alert, BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as RevurderingActions from '~features/revurdering/revurderingActions';
import { useAsyncActionCreatorWithArgsTransformer } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import yup from '~lib/validering';
import { RevurderingBunnknapper } from '~pages/saksbehandling/revurdering/bunnknapper/RevurderingBunnknapper';
import { VelgForhåndsvarselForm } from '~pages/saksbehandling/revurdering/OppsummeringPage/forhåndsvarsel/ForhåndsvarselForm';
import { InformasjonsRevurdering } from '~types/Revurdering';

import messages from './tilbakekrevingForm-nb';
import styles from './tilbakekrevingForm.module.less';

export enum TilbakekrevingsAvgjørelse {
    TILBAKEKREV = 'TILBAKEKREV',
    IKKE_TILBAKEKREV = 'IKKE_TILBAKEKREV',
    IKKE_AVGJORT = 'IKKE_AVGJORT',
}

export type TilbakekrevingsbehandlingFormData = {
    avgjørelse: TilbakekrevingsAvgjørelse;
};

enum Page {
    TILBAKEKREVING,
    FORHÅNDSVARSEL,
}

export const TilbakekrevingForm = (props: {
    forrigeUrl: string;
    revurdering: InformasjonsRevurdering;
    sakId: string;
}) => {
    const [pageValgt, setPage] = useState(Page.TILBAKEKREVING);

    const [lagreTilbakekrevingsbehandlingState, lagreTilbakekrevingsbehandling] =
        useAsyncActionCreatorWithArgsTransformer(
            RevurderingActions.lagreTilbakekrevingsbehandling,
            (avgjørelse: TilbakekrevingsAvgjørelse) => ({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                tilbakekrevingsbehandling: avgjørelse,
            }),
            () => setPage(Page.FORHÅNDSVARSEL)
        );

    const { formatMessage } = useI18n({ messages });

    const form = useForm<TilbakekrevingsbehandlingFormData>({
        defaultValues: {
            avgjørelse:
                props.revurdering.tilbakekrevingsbehandling?.avgjørelse ?? TilbakekrevingsAvgjørelse.IKKE_AVGJORT,
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
            {pageValgt === Page.TILBAKEKREVING && (
                <form
                    onSubmit={form.handleSubmit((values) => lagreTilbakekrevingsbehandling(values.avgjørelse))}
                    className={styles.form}
                >
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

                    <RevurderingBunnknapper
                        nesteKnappTekst={formatMessage('neste')}
                        tilbakeUrl={props.forrigeUrl}
                        loading={RemoteData.isPending(lagreTilbakekrevingsbehandlingState)}
                    />
                </form>
            )}
            {pageValgt === Page.FORHÅNDSVARSEL && (
                <VelgForhåndsvarselForm
                    onTilbakeClick={() => setPage(Page.TILBAKEKREVING)}
                    revurdering={props.revurdering}
                    sakId={props.sakId}
                />
            )}
        </>
    );
};
