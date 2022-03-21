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

export enum Tilbakekrevingsavgjørelse {
    TILBAKEKREV = 'TILBAKEKREV',
    IKKE_TILBAKEKREV = 'IKKE_TILBAKEKREV',
    IKKE_AVGJORT = 'IKKE_AVGJORT',
}

export type TilbakekrevingsbehandlingFormData = {
    avgjørelse: Tilbakekrevingsavgjørelse;
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
            (behandling: TilbakekrevingsbehandlingFormData) => ({
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                tilbakekrevingsbehandling: behandling,
            }),
            () => setPage(Page.FORHÅNDSVARSEL)
        );

    const { formatMessage } = useI18n({ messages });

    const form = useForm<TilbakekrevingsbehandlingFormData>({
        defaultValues: {
            avgjørelse:
                props.revurdering.tilbakekrevingsbehandling?.avgjørelse ?? Tilbakekrevingsavgjørelse.IKKE_AVGJORT,
        },
        resolver: yupResolver(
            yup
                .object<TilbakekrevingsbehandlingFormData>({
                    avgjørelse: yup
                        .mixed()
                        .required()
                        .defined()
                        .oneOf(
                            [Tilbakekrevingsavgjørelse.TILBAKEKREV, Tilbakekrevingsavgjørelse.IKKE_TILBAKEKREV],
                            'Aktsomhet må vurderes ved tilbakekreving'
                        ),
                })
                .required()
        ),
    });

    const tilbakekreving = form.watch('avgjørelse') === Tilbakekrevingsavgjørelse.TILBAKEKREV;

    return (
        <>
            {pageValgt === Page.TILBAKEKREVING && (
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
                                <Radio id={field.name} ref={field.ref} value={Tilbakekrevingsavgjørelse.TILBAKEKREV}>
                                    {formatMessage('aktsomhetJa')}
                                </Radio>
                                <Radio value={Tilbakekrevingsavgjørelse.IKKE_TILBAKEKREV}>
                                    {formatMessage('aktsomhetNei')}
                                </Radio>
                            </RadioGroup>
                        )}
                    />
                    {form.watch('avgjørelse') === Tilbakekrevingsavgjørelse.IKKE_TILBAKEKREV && (
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
                    tvingForhåndsvarsling={tilbakekreving}
                />
            )}
        </>
    );
};
