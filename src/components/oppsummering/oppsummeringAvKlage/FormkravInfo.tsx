import oppsummeringMessages from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage-nb';
import styles from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage.module.less';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { OppsummeringParMedBegrunnelse } from '~src/components/oppsummering/oppsummeringpar/OppsummeringParMedBegrunnelse';
import { useI18n } from '~src/lib/i18n';
import formkravMessages from '~src/pages/klage/vurderFormkrav/vurderFormkrav-nb';
import vurderingMessages from '~src/pages/klage/vurderingAvKlage/VurderingAvKlage-nb';
import { Klage } from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import * as DateUtils from '~src/utils/date/dateUtils';

export const FormkravInfo = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('label.vedtak.type')}
                    verdi={formatMessage(props.klagensVedtak.type)}
                    retning={'vertikal'}
                />
                <OppsummeringPar
                    label={formatMessage('label.vedtak.dato')}
                    verdi={DateUtils.formatDateTime(props.klagensVedtak.opprettet)}
                    retning={'vertikal'}
                />
            </div>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringParMedBegrunnelse
                    label={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                    verdi={
                        props.klage.klagesDetPåKonkreteElementerIVedtaket
                            ? formatMessage('label.ja')
                            : formatMessage('label.nei')
                    }
                    begrunnelse={
                        props.klage.klagesDetPåKonkreteElementerIVedtaket &&
                        props.klage.klagesDetPåKonkreteElementerIVedtaket.begrunnelse
                    }
                    retning={'vertikal'}
                    className={styles.tekstMaxBredde}
                />
                <OppsummeringParMedBegrunnelse
                    label={formatMessage('formkrav.innenforFrist.label')}
                    verdi={props.klage.innenforFristen && formatMessage(props.klage.innenforFristen.svar)}
                    begrunnelse={props.klage.innenforFristen && props.klage.innenforFristen.begrunnelse}
                    retning={'vertikal'}
                />
                <OppsummeringParMedBegrunnelse
                    label={formatMessage('formkrav.signert.label')}
                    verdi={props.klage.erUnderskrevet && formatMessage(props.klage.erUnderskrevet.svar)}
                    begrunnelse={props.klage.erUnderskrevet && props.klage.erUnderskrevet.begrunnelse}
                    retning={'vertikal'}
                />
                <OppsummeringParMedBegrunnelse
                    label={formatMessage('formkrav.fremsattrettslig.label')}
                    verdi={
                        props.klage.fremsattRettsligKlageinteresse &&
                        formatMessage(props.klage.fremsattRettsligKlageinteresse.svar)
                    }
                    begrunnelse={
                        props.klage.fremsattRettsligKlageinteresse &&
                        props.klage.fremsattRettsligKlageinteresse.begrunnelse
                    }
                    retning={'vertikal'}
                />
            </div>

            {props.klage.begrunnelse && (
                <OppsummeringPar
                    label={formatMessage('formkrav.begrunnelse.label')}
                    verdi={props.klage.begrunnelse}
                    retning={'vertikal'}
                    className={styles.formkravBegrunnelse}
                />
            )}
        </div>
    );
};
//slette             {props.klage.begrunnelse && (?
