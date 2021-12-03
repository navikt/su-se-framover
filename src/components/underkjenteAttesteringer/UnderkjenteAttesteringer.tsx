import { Alert, BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~lib/i18n';
import { Attestering, UnderkjennelseGrunn } from '~types/Behandling';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './underkjenteAttestering-nb';
import styles from './underkjenteAttesteringer.module.less';

const UnderkjenteAttesteringer = (props: { attesteringer: Attestering[] }) => {
    const underkjenteAttesteringer = props.attesteringer.filter((att) => att.underkjennelse != null);
    const { formatMessage } = useI18n({ messages });

    if (underkjenteAttesteringer.length === 0) {
        return null;
    }

    return (
        <div>
            {underkjenteAttesteringer.length > 0 && (
                <Alert variant="warning" inline className={styles.ikon}>
                    {formatMessage('underkjent.sendtTilbakeFraAttestering')}
                </Alert>
            )}
            <table className={styles.tabell}>
                <thead>
                    <tr>
                        <th>
                            <Label>{formatMessage('underkjent.tidspunkt')}</Label>
                        </th>
                        <th>
                            <Label>{formatMessage('underkjent.grunn')}</Label>
                        </th>
                        <th>
                            <Label>{formatMessage('underkjent.kommentar')}</Label>
                        </th>
                        <th>
                            <Label>{formatMessage('underkjent.attestant')}</Label>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {underkjenteAttesteringer.map((a) => (
                        <tr key={a.opprettet}>
                            <td>
                                <BodyShort className={styles.tidspunkt}>{formatDateTime(a.opprettet)}</BodyShort>
                            </td>
                            {/* underkjente attesteringer har alltid grunn og kommentar */}
                            {/* eslint-disable @typescript-eslint/no-non-null-assertion */}
                            <td>
                                <BodyShort>{underkjentGrunnTilTekst(a.underkjennelse!.grunn, formatMessage)}</BodyShort>
                            </td>
                            <td>
                                <BodyShort className={styles.kommentar}>{a.underkjennelse!.kommentar}</BodyShort>
                            </td>
                            <td>
                                <BodyShort className={styles.kommentar}>{a.attestant}</BodyShort>
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
