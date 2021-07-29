import AlertStripe from 'nav-frontend-alertstriper';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import React from 'react';

import { useI18n } from '~lib/hooks';
import { Attestering, UnderkjennelseGrunn } from '~types/Behandling';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './underkjenteAttestering-nb';
import styles from './underkjenteAttesteringer.module.less';

const UnderkjenteAttesteringer = (props: { attesteringer: Attestering[] }) => {
    const underkjenteAttesteringer = props.attesteringer.filter((att) => att.underkjennelse != null);
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            {underkjenteAttesteringer.length > 0 && (
                <AlertStripe type="advarsel" form="inline" className={styles.ikon}>
                    {formatMessage('underkjent.sendtTilbakeFraAttestering')}
                </AlertStripe>
            )}
            <table className={styles.tabell}>
                <thead>
                    <tr>
                        <th>
                            <Element>{formatMessage('underkjent.tidspunkt')}</Element>
                        </th>
                        <th>
                            <Element>{formatMessage('underkjent.grunn')}</Element>
                        </th>
                        <th>
                            <Element>{formatMessage('underkjent.kommentar')}</Element>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {underkjenteAttesteringer.map((a) => (
                        <tr key={a.opprettet}>
                            <td>
                                <Normaltekst className={styles.tidspunkt}>{formatDateTime(a.opprettet)}</Normaltekst>
                            </td>
                            {/* underkjente attesteringer har alltid grunn og kommentar */}
                            {/* eslint-disable @typescript-eslint/no-non-null-assertion */}
                            <td>
                                <Normaltekst>
                                    {underkjentGrunnTilTekst(a.underkjennelse!.grunn, formatMessage)}
                                </Normaltekst>
                            </td>
                            <td>
                                <Normaltekst className={styles.kommentar}>{a.underkjennelse!.kommentar}</Normaltekst>
                            </td>
                            {/* eslint-enable @typescript-eslint/no-non-null-assertion */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function underkjentGrunnTilTekst(
    grunn: UnderkjennelseGrunn,
    formatMessage: (string: keyof typeof messages) => string
): string {
    switch (grunn) {
        case UnderkjennelseGrunn.INNGANGSVILKÅRENE_ER_FEILVURDERT:
            return formatMessage('underkjent.grunn.InngangsvilkåreneErFeilvurdert');
        case UnderkjennelseGrunn.BEREGNINGEN_ER_FEIL:
            return formatMessage('underkjent.grunn.BeregningenErFeil');
        case UnderkjennelseGrunn.DOKUMENTASJON_MANGLER:
            return formatMessage('underkjent.grunn.DokumentasjonenMangler');
        case UnderkjennelseGrunn.VEDTAKSBREVET_ER_FEIL:
            return formatMessage('underkjent.grunn.VedtaksbrevetErFeil');
        case UnderkjennelseGrunn.ANDRE_FORHOLD:
            return formatMessage('underkjent.grunn.AndreForhold');
        default:
            return '';
    }
}

export default UnderkjenteAttesteringer;
