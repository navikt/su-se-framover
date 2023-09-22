import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { vurderTilbakekrevingsbehandling } from '~src/api/tilbakekrevingApi';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~src/components/feiloppsummering/Feiloppsummering';
import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { hookFormErrorsTilFeiloppsummering } from '~src/lib/validering';
import { KlasseKode, KlasseType, KravgrunnlagStatus } from '~src/types/Kravgrunnlag';
import { TilbakekrevingsValg } from '~src/types/ManuellTilbakekrevingsbehandling';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import messages from '../../Tilbakekreving-nb';

import styles from './VurderTilbakekreving.module.less';
import { VurderTilbakekrevingFormData, vurderTilbakekrevingSchema } from './VurderTilbakekrevingUtils';

const kravgrunnlag = {
    eksternKravgrunnlagsId: '123456',
    eksternVedtakId: '654321',
    kontrollfelt: '2023-09-19-10.01.03.842916',
    status: KravgrunnlagStatus.NY,
    grunnlagsperiode: [
        {
            periode: {
                fraOgMed: '2023-06-01',
                tilOgMed: '2023-06-30',
            },
            beløpSkattMnd: 4395,
            grunnlagsbeløp: [
                {
                    kode: KlasseKode.KL_KODE_FEIL_INNT,
                    type: KlasseType.FEIL,
                    beløpTidligereUtbetaling: 0,
                    beløpNyUtbetaling: 2643,
                    beløpSkalTilbakekreves: 0,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 0,
                },
                {
                    kode: KlasseKode.SUUFORE,
                    type: KlasseType.YTEL,
                    beløpTidligereUtbetaling: 16181,
                    beløpNyUtbetaling: 13538,
                    beløpSkalTilbakekreves: 2643,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 43.9983,
                },
            ],
        },
        {
            periode: {
                fraOgMed: '2023-07-01',
                tilOgMed: '2023-07-31',
            },
            beløpSkattMnd: 4395,
            grunnlagsbeløp: [
                {
                    kode: KlasseKode.KL_KODE_FEIL_INNT,
                    type: KlasseType.FEIL,
                    beløpTidligereUtbetaling: 0,
                    beløpNyUtbetaling: 2643,
                    beløpSkalTilbakekreves: 0,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 0,
                },
                {
                    kode: KlasseKode.SUUFORE,
                    type: KlasseType.YTEL,
                    beløpTidligereUtbetaling: 16181,
                    beløpNyUtbetaling: 13538,
                    beløpSkalTilbakekreves: 2643,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 43.9983,
                },
            ],
        },
        {
            periode: {
                fraOgMed: '2023-08-01',
                tilOgMed: '2023-08-31',
            },
            beløpSkattMnd: 4395,
            grunnlagsbeløp: [
                {
                    kode: KlasseKode.KL_KODE_FEIL_INNT,
                    type: KlasseType.FEIL,
                    beløpTidligereUtbetaling: 0,
                    beløpNyUtbetaling: 2643,
                    beløpSkalTilbakekreves: 0,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 0,
                },
                {
                    kode: KlasseKode.SUUFORE,
                    type: KlasseType.YTEL,
                    beløpTidligereUtbetaling: 16181,
                    beløpNyUtbetaling: 13538,
                    beløpSkalTilbakekreves: 2643,
                    beløpSkalIkkeTilbakekreves: 0,
                    skatteProsent: 43.9983,
                },
            ],
        },
    ],
};

const VurderTilbakekreving = (props: { sakId: string }) => {
    const fieldName = 'grunnlagsperioder';
    const { formatMessage } = useI18n({ messages });
    const [status, lagre] = useApiCall(vurderTilbakekrevingsbehandling);

    //TODO ta inn behandling som props
    const behandlingensKravgrunnlag = { ...kravgrunnlag };

    const form = useForm<VurderTilbakekrevingFormData>({
        defaultValues: {
            grunnlagsperioder: behandlingensKravgrunnlag.grunnlagsperiode.map((periode) => ({
                periode: periode.periode,
                skalTilbakekreves: null,
            })),
        },
        resolver: yupResolver(vurderTilbakekrevingSchema),
    });

    const handleSubmit = (values: VurderTilbakekrevingFormData) => {
        console.log('submitted: ', values);

        lagre({
            sakId: props.sakId,
            behandlingId: '123',
            vurderinger: values.grunnlagsperioder.map((periode) => ({
                periode: periode.periode,
                valg: periode.skalTilbakekreves!,
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
                                <li key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                                    <Panel border className={styles.periodePanel}>
                                        <div>
                                            <Heading size="small">
                                                {formatMonthYear(periode.periode.fraOgMed)}-
                                                {formatMonthYear(periode.periode.tilOgMed)}
                                            </Heading>
                                            <Controller
                                                control={form.control}
                                                name={`${fieldName}.${idx}.skalTilbakekreves`}
                                                render={({ field, fieldState }) => (
                                                    <RadioGroup
                                                        {...field}
                                                        legend={formatMessage(
                                                            'vurderTilbakekreving.skalBeløpBliTilbakekrevd',
                                                        )}
                                                        hideLegend
                                                        error={fieldState.error?.message}
                                                    >
                                                        <Radio value={TilbakekrevingsValg.SKAL_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalTilbakekreve')}
                                                        </Radio>
                                                        <Radio value={TilbakekrevingsValg.SKAL_IKKE_TILBAKEKREVES}>
                                                            {formatMessage('vurderTilbakekreving.skalIkkeTilbakekreve')}
                                                        </Radio>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>

                                        <Heading size="small">
                                            Kan vurdere å vise nøkkelinfo fra perioden her. Resten ser dem på
                                            oppsummeringen
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
                right: <OppsummeringAvKravgrunnlag kravgrunnlag={kravgrunnlag} />,
            }}
        </ToKolonner>
    );
};

export default VurderTilbakekreving;
