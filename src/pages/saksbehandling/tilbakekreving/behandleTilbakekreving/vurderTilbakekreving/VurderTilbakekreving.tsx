import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, UseFormTrigger, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { vurderTilbakekrevingsbehandling } from '~src/features/TilbakekrevingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { Grunnlagsperiode } from '~src/types/Kravgrunnlag';
import {
    ManuellTilbakekrevingsbehandling,
    TilbakekrevingSteg,
    TilbakekrevingsVurdering,
} from '~src/types/ManuellTilbakekrevingsbehandling';
import Måned from '~src/types/Måned';

import messages from '../../Tilbakekreving-nb';

import styles from './VurderTilbakekreving.module.less';
import {
    VurderTilbakekrevingFormData,
    eqVurderTilbakekrevingFormData,
    vurderTilbakekrevingSchema,
} from './VurderTilbakekrevingUtils';

const VurderTilbakekreving = (props: {
    sakId: string;
    saksversjon: number;
    tilbakekreving: ManuellTilbakekrevingsbehandling;
}) => {
    const fieldName = 'grunnlagsperioder';
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useAsyncActionCreator(vurderTilbakekrevingsbehandling);

    const nesteUrl = routes.tilbakekrevingValgtBehandling.createURL({
        sakId: props.sakId,
        behandlingId: props.tilbakekreving.id,
        steg: TilbakekrevingSteg.Vedtaksbrev,
    });

    const defaultValuesFraBehandling = props.tilbakekreving.månedsvurderinger.map((måned) => ({
        måned: Måned.fromString(måned.måned),
        vurdering: måned.vurdering,
    }));

    const defaultValuesFraKravgunnlag = props.tilbakekreving.kravgrunnlag.grunnlagsperiode.map((periode) => ({
        måned: Måned.fromStringPeriode(periode.periode),
        vurdering: null,
    }));

    const initialValues =
        defaultValuesFraBehandling.length > 0
            ? { grunnlagsperioder: defaultValuesFraBehandling }
            : { grunnlagsperioder: defaultValuesFraKravgunnlag };

    const form = useForm<VurderTilbakekrevingFormData>({
        defaultValues: initialValues,
        resolver: yupResolver(vurderTilbakekrevingSchema),
    });
    const { fields } = useFieldArray({ name: fieldName, control: form.control });

    const save = (data: VurderTilbakekrevingFormData, onSuccess: () => void) => {
        lagre(
            {
                sakId: props.sakId,
                versjon: props.saksversjon,
                behandlingId: props.tilbakekreving.id,
                måneder: data.grunnlagsperioder.map((periode) => ({
                    måned: periode.måned.toString(),
                    vurdering: periode.vurdering!,
                })),
            },
            onSuccess,
        );
    };

    const handleLagreOgFortsettSenereClick = async (
        data: VurderTilbakekrevingFormData,
        trigger: UseFormTrigger<VurderTilbakekrevingFormData>,
    ) => {
        if (eqVurderTilbakekrevingFormData.equals(initialValues, data)) {
            navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        await trigger().then((isValid) => {
            if (isValid) {
                save(data, () => navigate(routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })));
            }
        });
    };

    const handleSubmit = (values: VurderTilbakekrevingFormData) => {
        if (eqVurderTilbakekrevingFormData.equals(initialValues, values)) {
            navigate(nesteUrl);
            return;
        }
        save(values, () => navigate(nesteUrl));
    };

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
                                        <KravgrunnlagPeriodeInfo
                                            grunnlagsperiode={props.tilbakekreving.kravgrunnlag.grunnlagsperiode[idx]}
                                        />
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
                                neste={{
                                    loading: RemoteData.isPending(status),
                                }}
                                fortsettSenere={{
                                    onClick: () => handleLagreOgFortsettSenereClick(form.getValues(), form.trigger),
                                }}
                                tilbake={{
                                    url: routes.tilbakekrevingValgtBehandling.createURL({
                                        sakId: props.sakId,
                                        behandlingId: props.tilbakekreving.id,
                                        steg: TilbakekrevingSteg.Forhåndsvarsling,
                                    }),
                                }}
                            />

                            {RemoteData.isFailure(status) && <ApiErrorAlert error={status.error} />}
                        </div>
                    </form>
                ),
                right: (
                    <OppsummeringAvKravgrunnlag
                        kravgrunnlag={props.tilbakekreving.kravgrunnlag}
                        basicBareMetaInfo={{ medTittel: true }}
                    />
                ),
            }}
        </ToKolonner>
    );
};

const KravgrunnlagPeriodeInfo = (props: { grunnlagsperiode: Grunnlagsperiode }) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.kravgrunnlagsInfoContainer}>
            <div className={styles.detalje}>
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.skatteBeløp')}
                    verdi={props.grunnlagsperiode.beløpSkattMnd}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.skatteprosent')}
                    verdi={props.grunnlagsperiode.ytelse.skatteProsent}
                    retning="vertikal"
                />
            </div>

            <div className={styles.detalje}>
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.tidligereUtbetalt')}
                    verdi={props.grunnlagsperiode.ytelse.beløpTidligereUtbetaling}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.nyUtbetaling')}
                    verdi={props.grunnlagsperiode.ytelse.beløpNyUtbetaling}
                    retning="vertikal"
                />
            </div>
            <div className={styles.detalje}>
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.skalTilbakekreves')}
                    verdi={props.grunnlagsperiode.ytelse.beløpSkalTilbakekreves}
                    retning="vertikal"
                />
                <OppsummeringPar
                    label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.skalIkkeTilbakekreves')}
                    verdi={props.grunnlagsperiode.ytelse.beløpSkalIkkeTilbakekreves}
                    retning="vertikal"
                />
            </div>
            <OppsummeringPar
                label={formatMessage('vurderTilbakekreving.kravgrunnlagsInfo.nettoBeløp')}
                verdi={props.grunnlagsperiode.ytelse.nettoBeløp}
                retning="vertikal"
            />
        </div>
    );
};

export default VurderTilbakekreving;
