import { BodyShort, Label, Textarea } from '@navikt/ds-react';

import oppsummeringMessages from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage-nb';
import styles from '~src/components/oppsummering/oppsummeringAvKlage/oppsummeringAvKlage.module.less';
import { OppsummeringPar } from '~src/components/oppsummering/oppsummeringpar/OppsummeringPar';
import { useI18n } from '~src/lib/i18n';
import formkravMessages from '~src/pages/klage/vurderFormkrav/vurderFormkrav-nb';
import vurderingMessages from '~src/pages/klage/vurderingAvKlage/VurderingAvKlage-nb';
import { Klage } from '~src/types/Klage';
import { erKlageDelvisOmgjortKA, erKlageOmgjort, erKlageOpprettholdt } from '~src/utils/klage/klageUtils';

export const VurderInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('form.vurdering.label')}
                    verdi={formatMessage(props.klage.vedtaksvurdering!.type)}
                    retning={'vertikal'}
                />

                {erKlageOmgjort(props.klage) && (
                    <>
                        <OppsummeringPar
                            label={formatMessage('form.omgjørVedtak.årsak.label')}
                            verdi={formatMessage(props.klage.vedtaksvurdering.omgjør.årsak)}
                            retning={'vertikal'}
                        />
                        <OppsummeringPar
                            label={formatMessage('label.begrunnelse')}
                            verdi={props.klage.vedtaksvurdering.omgjør.begrunnelse}
                            retning={'vertikal'}
                        />
                    </>
                )}
                {erKlageOpprettholdt(props.klage) && (
                    <div>
                        <Label>{formatMessage('form.oversendelseKa.hjemmel.label')}</Label>
                        <div className={styles.hjemlerContainer}>
                            {props.klage.vedtaksvurdering.oppretthold.hjemler.map((hjemel) => (
                                <BodyShort key={hjemel}>{formatMessage(hjemel)}</BodyShort>
                            ))}
                        </div>
                        <div>
                            <Textarea resize readOnly label={formatMessage('klagenotat.info')} maxRows={10}>
                                {props.klage.vedtaksvurdering.oppretthold.klagenotat}
                            </Textarea>
                        </div>
                    </div>
                )}
                {erKlageDelvisOmgjortKA(props.klage) && (
                    <div>
                        <Label>{formatMessage('form.oversendelseKa.hjemmel.label')}</Label>
                        <div className={styles.hjemlerContainer}>
                            {props.klage.vedtaksvurdering.delvisOmgjøringKa.hjemler.map((hjemel) => (
                                <BodyShort key={hjemel}>{formatMessage(hjemel)}</BodyShort>
                            ))}
                        </div>
                        <div>
                            <Textarea resize readOnly label={formatMessage('klagenotat.info')} maxRows={10}>
                                {props.klage.vedtaksvurdering.delvisOmgjøringKa.klagenotat}
                            </Textarea>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
