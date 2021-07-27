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

    const tidspunkter = underkjenteAttesteringer.map((a) => a.opprettet);
    /* underkjente attesteringer har alltid grunn og kommentar */
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const grunner = underkjenteAttesteringer.map((a) => a.underkjennelse!.grunn);
    const kommentarer = underkjenteAttesteringer.map((a) => a.underkjennelse!.kommentar);
    /*eslint-enable @typescript-eslint/no-non-null-assertion*/

    return (
        <div>
            {underkjenteAttesteringer.length > 0 && (
                <AlertStripe type="advarsel" form="inline" className={styles.ikon}>
                    {formatMessage('underkjent.sendtTilbakeFraAttestering')}
                </AlertStripe>
            )}
            <div className={styles.underkjennelsesInformasjonsContainer}>
                <ul>
                    {tidspunkter.map((t) => (
                        <li key={t} className={styles.informasjonsElementContainer}>
                            <Element>{formatMessage('underkjent.tidspunkt')}</Element>
                            <Normaltekst className={styles.tidspunkt}>{formatDateTime(t)}</Normaltekst>
                        </li>
                    ))}
                </ul>
                <ul>
                    {grunner.map((g, i) => (
                        <li key={i} className={styles.informasjonsElementContainer}>
                            <Element>{formatMessage('underkjent.grunn')}</Element>
                            <Normaltekst className={styles.grunn}>
                                {underkjentGrunnTilTekst(g, formatMessage)}
                            </Normaltekst>
                        </li>
                    ))}
                </ul>
                <ul>
                    {kommentarer.map((k) => (
                        <li key={k} className={styles.informasjonsElementContainer}>
                            <Element>{formatMessage('underkjent.kommentar')}</Element>
                            <Normaltekst className={styles.kommentar}>{k}</Normaltekst>
                        </li>
                    ))}
                </ul>
            </div>
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
