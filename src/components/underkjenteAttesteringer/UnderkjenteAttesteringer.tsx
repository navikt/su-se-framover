import { Alert, BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import { useI18n } from '~src/lib/i18n';
import { underkjennelsesGrunnTextMapper } from '~src/typeMappinger/UnderkjennelseGrunn';
import { Attestering } from '~src/types/Behandling';
import { formatDateTime } from '~src/utils/date/dateUtils';

import messages from './underkjenteAttestering-nb';
import * as styles from './underkjenteAttesteringer.module.less';

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
                            <td>
                                <BodyShort>{underkjennelsesGrunnTextMapper[a.underkjennelse!.grunn]}</BodyShort>
                            </td>
                            <td>
                                <BodyShort className={styles.kommentar}>{a.underkjennelse!.kommentar}</BodyShort>
                            </td>
                            <td>
                                <BodyShort className={styles.kommentar}>{a.attestant}</BodyShort>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UnderkjenteAttesteringer;
