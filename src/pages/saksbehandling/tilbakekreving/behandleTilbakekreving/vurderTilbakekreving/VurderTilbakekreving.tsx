import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { BodyShort, Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { vurderTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { KlasseKode, KlasseType } from '~src/types/Kravgrunnlag';
import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingsVurdering,
} from '~src/types/ManuellTilbakekrevingsbehandling';
import Måned from '~src/types/Måned';

import messages from '../../Tilbakekreving-nb';

import styles from './VurderTilbakekreving.module.less';
import { VurderTilbakekrevingFormData, vurderTilbakekrevingSchema } from './VurderTilbakekrevingUtils';

const VurderTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const fieldName = 'grunnlagsperioder';
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(vurderTilbakekrevingsbehandling);

    const form = useForm<VurderTilbakekrevingFormData>({
        defaultValues: {
            grunnlagsperioder: props.tilbakekreving.kravgrunnlag.grunnlagsperiode.map((periode) => ({
                måned: Måned.fromStringPeriode(periode.periode),
                vurdering: null,
            })),
        },
        resolver: yupResolver(vurderTilbakekrevingSchema),
    });

    const handleSubmit = (values: VurderTilbakekrevingFormData) => {
        lagre({
            sakId: props.sakId,
            saksversjon: props.saksversjon,
            behandlingId: props.tilbakekreving.id,
            måneder: values.grunnlagsperioder.map((periode) => ({
                måned: periode.måned.toString(),
                vurdering: periode.vurdering!,
            })),
        });
    };

    const { fields } = useFieldArray({
        name: fieldName,
        control: form.control,
    });

    return (
        <ToKolonner tittel={formatMessage('vurderTilbakekreving.tittel')}>
            {{
                left: (
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <ul className={styles.grunnlagsperioderContainer}>
                            {fields.map((periode, idx) => (
                                <li key={`${periode.måned}`}>
                                    <Panel border className={styles.periodePanel}>
                                        <div>
                                            <Heading size="small">{periode.måned.toFormattedString()}</Heading>
                                            <Controller
                                                control={form.control}
                                                name={`${fieldName}.${idx}.vurdering`}
                                                render={({ field, fieldState }) => (
                                                    <RadioGroup
                                                        {...field}
                                                        legend={formatMessage(
                                                            'vurderTilbakekreving.skalBeløpBliTilbakekrevd',
                                                        )}
                                                        hideLegend
                                                        error={fieldState.error?.message}
                                                    >
                                                        <Radio value={TilbakekrevingsVurdering.SKAL_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalTilbakekreve')}
                                                        </Radio>
                                                        <Radio value={TilbakekrevingsVurdering.SKAL_IKKE_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalIkkeTilbakekreve')}
                                                        </Radio>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>

                                        <Heading size="small">
                                            {props.tilbakekreving.kravgrunnlag.grunnlagsperiode[idx].grunnlagsbeløp
                                                .filter(
                                                    (beløp) =>
                                                        beløp.kode === KlasseKode.SUUFORE &&
                                                        beløp.type === KlasseType.YTEL,
                                                )
                                                .map((beløp, idx) => (
                                                    <div key={idx}>
                                                        <div>
                                                            <BodyShort>Skatteprosent</BodyShort>
                                                            <BodyShort>{beløp.skatteProsent}</BodyShort>
                                                        </div>
                                                        <div>
                                                            <BodyShort>Tidligere utbetalt</BodyShort>
                                                            <BodyShort>{beløp.beløpTidligereUtbetaling}</BodyShort>
                                                        </div>
                                                        <div>
                                                            <BodyShort>ny utbetaling</BodyShort>
                                                            <BodyShort>{beløp.beløpNyUtbetaling}</BodyShort>
                                                        </div>
                                                        <div>
                                                            <BodyShort>beløp skal tilbakekreves</BodyShort>
                                                            <BodyShort>{beløp.beløpSkalTilbakekreves}</BodyShort>
                                                        </div>
                                                        <div>
                                                            <BodyShort>beløp skal ikke tilbakekreves</BodyShort>
                                                            <BodyShort>{beløp.beløpSkalIkkeTilbakekreves}</BodyShort>
                                                        </div>
                                                    </div>
                                                ))}
                                        </Heading>
                                    </Panel>
                                </li>
                            ))}
                        </ul>

                        <div>
                            <Feiloppsummering
                                tittel={formatMessage('vurderTilbakekreving.feiloppsummering')}
                                className={styles.feiloppsummering}
                                feil={hookFormErrorsTilFeiloppsummering(form.formState.errors)}
                                hidden={hookFormErrorsTilFeiloppsummering(form.formState.errors).length === 0}
                            />
                            <Navigasjonsknapper
                                fortsettSenere={{}}
                                tilbake={{
                                    url: routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }),
                                }}
                            />

                            {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        </div>
                    </form>
                ),
                right: <OppsummeringAvKravgrunnlag kravgrunnlag={props.tilbakekreving.kravgrunnlag} />,
            }}
        </ToKolonner>
    );
};

export default VurderTilbakekreving;
