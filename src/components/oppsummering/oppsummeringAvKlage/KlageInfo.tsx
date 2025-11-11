import classNames from 'classnames';
import styles from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage.module.less';
import oppsummeringMessages from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage-nb';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { useI18n } from '~src/lib/i18n';
import { Klage } from '~src/types/Klage';
import * as DateUtils from '~src/utils/date/dateUtils';

export const KlageInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({ messages: oppsummeringMessages });

    return (
        <div className={classNames(styles.informasjonsContainer, styles.informasjonsContentContainer)}>
            {[
                {
                    tittel: formatMessage('label.saksbehandler'),
                    verdi: props.klage.saksbehandler,
                },
                {
                    tittel: formatMessage('label.journalpostId'),
                    verdi: props.klage.journalpostId,
                },
                {
                    tittel: formatMessage('label.klageMottatt'),
                    verdi: DateUtils.formatDate(props.klage.datoKlageMottatt),
                },
            ].map((item) => (
                <OppsummeringPar key={item.tittel} label={item.tittel} verdi={item.verdi} retning={'vertikal'} />
            ))}
        </div>
    );
};
