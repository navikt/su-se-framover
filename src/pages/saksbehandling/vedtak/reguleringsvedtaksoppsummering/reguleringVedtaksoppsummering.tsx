import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Panel } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import { hentTidligereGrunnlagsdataForVedtak } from '~api/revurderingApi';
import VisBeregning from '~components/beregningOgSimulering/beregning/VisBeregning';
import { Utbetalingssimulering } from '~components/beregningOgSimulering/simulering/simulering';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import { Regulering } from '~types/Regulering';
import { Vedtak } from '~types/Vedtak';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './reguleringVedtaksoppsummering-nb';
import styles from './reguleringVedtaksoppsummering.module.less';

interface Props {
    sakId: string;
    vedtak: Vedtak;
    regulering: Regulering;
}
const ReguleringVedtaksoppsummering = (props: Props) => {
    const [historiskGrunnlagsdata, hentHistoriskGrunnlagsdata] = useApiCall(hentTidligereGrunnlagsdataForVedtak);
    const { formatMessage } = useI18n({ messages });

    useEffect(() => {
        hentHistoriskGrunnlagsdata({ sakId: props.sakId, vedtakId: props.vedtak.id });
    }, []);

    return pipe(
        historiskGrunnlagsdata,
        RemoteData.fold(
            () => null,
            () => null,
            () => null,
            () => {
                return (
                    <div className={styles.container}>
                        <Oppsummeringspanel
                            tittel={formatMessage('oppsummering')}
                            farge={Oppsummeringsfarge.Lilla}
                            ikon={Oppsummeringsikon.Liste}
                        >
                            <div className={styles.oppsummering}>
                                <div>
                                    <Label>{formatMessage('oppsummering.resultat.label')}</Label>
                                    <BodyShort>{formatMessage('iverksatt')}</BodyShort>
                                </div>

                                <div>
                                    <Label>{formatMessage('iverksatt')}</Label>
                                    <BodyShort>{formatDateTime(props.vedtak.opprettet)}</BodyShort>
                                </div>

                                <div>
                                    <Label>{formatMessage('oppsummering.type.label')}</Label>
                                    <BodyShort>{'G regulering'}</BodyShort>
                                </div>

                                <div>
                                    <Label>{formatMessage('oppsummering.utført.label')}</Label>
                                    <BodyShort>{formatMessage('automatisk')}</BodyShort>
                                </div>
                            </div>
                            {/* // TODO ai: Lag oppsummering for uførhet */}
                            {/* <Uførhet
                                nyeData={props.regulering.grunnlagsdataOgVilkårsvurderinger.uføre}
                                gamleData={historiskData.uføre}
                            /> */}
                        </Oppsummeringspanel>
                        {props.regulering.beregning && props.regulering.simulering && (
                            <Oppsummeringspanel
                                tittel={formatMessage('beregning.tittel')}
                                farge={Oppsummeringsfarge.Grønn}
                                ikon={Oppsummeringsikon.Kalkulator}
                            >
                                <div className={styles.beregning}>
                                    <Panel border>
                                        <VisBeregning beregning={props.regulering.beregning} />
                                    </Panel>
                                    <Panel border>
                                        <Utbetalingssimulering simulering={props.regulering.simulering} utenTittel />
                                    </Panel>
                                </div>
                            </Oppsummeringspanel>
                        )}
                    </div>
                );
            }
        )
    );
};

export default ReguleringVedtaksoppsummering;
