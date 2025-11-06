import { FormkravInfo } from '~src/components/oppsummering/oppsummeringAvKlage/FormkravInfo';
import styles from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak.module.less';
import messages from '~src/components/oppsummering/oppsummeringAvVedtak/OppsummeringAvVedtak-nb';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { useI18n } from '~src/lib/i18n';
import { Klage } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import { formatDate, formatDateTime } from '~src/utils/date/dateUtils';
import { splitStatusOgResultatFraKlage } from '~src/utils/klage/klageUtils';

export const PartialOppsummeringAvKlage = (props: { v: Vedtak; k: Klage }) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('klage.behandlingStartet')}
                    verdi={formatDateTime(props.k.opprettet)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.vedtakOgBehandlingInfoContainer}>
                <OppsummeringPar
                    label={formatMessage('behandling.resultat')}
                    verdi={splitStatusOgResultatFraKlage(props.k).resultat}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('klage.journalpostId')}
                    verdi={props.k.journalpostId}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('klage.datoKlageMottatt')}
                    verdi={formatDate(props.k.datoKlageMottatt)}
                    retning={'vertikal'}
                />
            </div>
            <FormkravInfo klage={props.k} klagensVedtak={props.v} />
        </div>
    );
};
