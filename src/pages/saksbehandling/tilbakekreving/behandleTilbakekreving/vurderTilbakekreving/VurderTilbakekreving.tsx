import { Heading, Panel, Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';

import Navigasjonsknapper from '~src/components/navigasjonsknapper/Navigasjonsknapper';
import OppsummeringAvKravgrunnlag from '~src/components/oppsummering/kravgrunnlag/OppsummeringAvKravgrunnlag';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { useI18n } from '~src/lib/i18n';
import { KlasseKode, KlasseType, KravgrunnlagStatus } from '~src/types/Kravgrunnlag';
import { formatMonthYear } from '~src/utils/date/dateUtils';

import messages from '../../Tilbakekreving-nb';

import styles from './VurderTilbakekreving.module.less';

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

const VurderTilbakekreving = () => {
    const { formatMessage } = useI18n({ messages });

    return (
        <ToKolonner tittel={formatMessage('vurderTilbakekreving.tittel')}>
            {{
                left: (
                    <div>
                        <ul className={styles.grunnlagsperioderContainer}>
                            {kravgrunnlag.grunnlagsperiode.map((periode) => (
                                <li key={`${periode.periode.fraOgMed}-${periode.periode.tilOgMed}`}>
                                    <Panel border>
                                        <Heading size="small">
                                            {formatMonthYear(periode.periode.fraOgMed)}-
                                            {formatMonthYear(periode.periode.tilOgMed)}
                                        </Heading>
                                        <RadioGroup legend="Skal beløpet bli tilbakekrevd?">
                                            <Radio value={true}>Ja</Radio>
                                            <Radio value={false}>Nei</Radio>
                                        </RadioGroup>
                                    </Panel>
                                </li>
                            ))}
                        </ul>
                        <div>
                            <Navigasjonsknapper
                                neste={{
                                    onClick: console.log,
                                }}
                                fortsettSenere={{
                                    onClick: undefined,
                                }}
                                tilbake={{
                                    url: undefined,
                                    onClick: undefined,
                                }}
                            />
                        </div>
                    </div>
                ),
                right: <OppsummeringAvKravgrunnlag kravgrunnlag={kravgrunnlag} />,
            }}
        </ToKolonner>
    );
};

export default VurderTilbakekreving;
