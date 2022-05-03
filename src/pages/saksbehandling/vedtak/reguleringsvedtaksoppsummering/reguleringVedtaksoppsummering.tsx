import * as RemoteData from '@devexperts/remote-data-ts';
import { BodyShort, Label, Panel } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { hentTidligereGrunnlagsdataForVedtak } from '~src/api/revurderingApi';
import VisBeregning from '~src/components/beregningOgSimulering/beregning/VisBeregning';
import { Utbetalingssimulering } from '~src/components/beregningOgSimulering/simulering/simulering';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~src/components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { pipe } from '~src/lib/fp';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { Regulering, Reguleringstype } from '~src/types/Regulering';
import { Vedtak } from '~src/types/Vedtak';
import { formatDateTime } from '~src/utils/date/dateUtils';

import messages from './reguleringVedtaksoppsummering-nb';
import * as styles from './reguleringVedtaksoppsummering.module.less';

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
                                    <BodyShort>
                                        {props.regulering.reguleringstype === Reguleringstype.AUTOMATISK
                                            ? formatMessage('automatisk')
                                            : formatMessage('manuell')}
                                    </BodyShort>
                                </div>
                                <div>
                                    <Label>{formatMessage('oppsummering.saksbehandler.label')}</Label>
                                    <BodyShort>{props.regulering.saksbehandler}</BodyShort>
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
