import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { InformationFilled } from '@navikt/ds-icons';
import { Alert, BodyLong, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import * as RevurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreatorWithArgsTransformer } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import yup from '~src/lib/validering';
import { Navigasjonsknapper } from '~src/pages/saksbehandling/revurdering/bunnknapper/Navigasjonsknapper';
import { VelgForhåndsvarselForm } from '~src/pages/saksbehandling/revurdering/OppsummeringPage/forhåndsvarsel/ForhåndsvarselForm';
import { InformasjonsRevurdering } from '~src/types/Revurdering';

import messages from './tilbakekrevingForm-nb';
import * as styles from './tilbakekrevingForm.module.less';

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
    forrige: { url: string; visModal: boolean };
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

                    <Navigasjonsknapper
                        nesteKnappTekst={formatMessage('neste')}
                        tilbake={props.forrige}
                        loading={RemoteData.isPending(lagreTilbakekrevingsbehandlingState)}
                    />
                </form>
            )}
            {pageValgt === Page.FORHÅNDSVARSEL && (
                <VelgForhåndsvarselForm
                    tilbake={{ onTilbakeClick: () => setPage(Page.TILBAKEKREVING) }}
                    revurdering={props.revurdering}
                    sakId={props.sakId}
                    defaultVedtakstekst={formatMessage('tilbakekrevingForhåndstekst')}
                />
            )}
        </>
    );
};
