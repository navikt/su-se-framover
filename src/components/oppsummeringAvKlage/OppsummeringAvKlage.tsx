import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import { useI18n } from '~lib/i18n';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { erKlageOmgjort, erKlageOpprettholdt } from '~utils/klage/klageUtils';

import formkravMessages from '../../pages/klage/klage-nb';
import vurderingMessages from '../../pages/klage/vurderingAvKlage/VurderingAvKlage-nb';
import * as DateUtils from '../../utils/date/dateUtils';

import oppsummeringMessages from './oppsummeringAvKlage-nb';
import styles from './oppsummeringAvKlage.module.less';

const OppsummeringAvKlage = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({
        messages: oppsummeringMessages,
    });
    return (
        <div className={styles.oppsummeringPanelContainer}>
            <Oppsummeringspanel
                tittel={formatMessage('oppsummering.heading')}
                farge={Oppsummeringsfarge.Lilla}
                ikon={Oppsummeringsikon.Liste}
            >
                <div className={styles.panelInnholdContainer}>
                    <KlageInfo klage={props.klage} />
                    <FormkravInfo klage={props.klage} klagensVedtak={props.klagensVedtak} />
                    <VurderInfo klage={props.klage} />
                </div>
            </Oppsummeringspanel>
        </div>
    );
};

const KlageInfo = (props: { klage: Klage }) => {
    const { intl } = useI18n({ messages: oppsummeringMessages });

    return (
        <div className={classNames(styles.informasjonsContainer, styles.informasjonsContainerContent)}>
            {[
                {
                    tittel: intl.formatMessage({ id: 'label.saksbehandler' }),
                    verdi: props.klage.saksbehandler,
                },
                {
                    tittel: intl.formatMessage({ id: 'label.journalpostId' }),
                    verdi: props.klage.journalpostId,
                },
                {
                    tittel: intl.formatMessage({ id: 'label.klageMottatt' }),
                    verdi: DateUtils.formatDate(props.klage.datoKlageMottatt),
                },
            ].map((item) => (
                <div key={item.tittel}>
                    <Label>{item.tittel}</Label>
                    <BodyShort>{item.verdi}</BodyShort>
                </div>
            ))}
        </div>
    );
};

const FormkravInfo = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContainerContent}>
                <div>
                    <Label>{formatMessage('label.vedtak.type')}</Label>
                    <BodyShort>{props.klagensVedtak.type}</BodyShort>
                </div>
                <div>
                    <Label>{formatMessage('label.vedtak.dato')}</Label>
                    <BodyShort>{DateUtils.formatDateTime(props.klagensVedtak.opprettet)}</BodyShort>
                </div>
            </div>

            <div className={styles.informasjonsContainerContent}>
                <div>
                    <Label>{formatMessage('formkrav.innenforFrist.label')}</Label>
                    <BodyShort>{props.klage.innenforFristen && formatMessage(props.klage.innenforFristen)}</BodyShort>
                </div>
                <div>
                    <Label>{formatMessage('formkrav.klagesPåKonkreteElementer.label')}</Label>
                    <BodyShort>
                        {props.klage.klagesDetPåKonkreteElementerIVedtaket
                            ? formatMessage('label.ja')
                            : formatMessage('label.nei')}
                    </BodyShort>
                </div>
                <div>
                    <Label>{formatMessage('formkrav.signert.label')}</Label>
                    <BodyShort>{props.klage.erUnderskrevet && formatMessage(props.klage.erUnderskrevet)}</BodyShort>
                </div>
            </div>

            <div>
                <Label>{formatMessage('formkrav.begrunnelse.label')}</Label>
                <BodyShort>{props.klage.begrunnelse}</BodyShort>
            </div>
        </div>
    );
};

const VurderInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContainerContent}>
                <div>
                    <Label>{formatMessage('form.vurdering.label')}</Label>
                    {/* Vurderingstypen skal finnes når man kommer til oppsummeringen */}
                    {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                    <BodyShort>{formatMessage(props.klage.vedtaksvurdering!.type)}</BodyShort>
                </div>

                {erKlageOmgjort(props.klage) ? (
                    <>
                        <div>
                            <Label>{formatMessage('form.omgjørVedtak.årsak.label')}</Label>
                            <BodyShort>{formatMessage(props.klage.vedtaksvurdering.omgjør.årsak)}</BodyShort>
                        </div>
                        <div>
                            <Label>{formatMessage('label.årsaksutfall')}</Label>
                            <BodyShort>{formatMessage(props.klage.vedtaksvurdering.omgjør.utfall)}</BodyShort>
                        </div>
                    </>
                ) : erKlageOpprettholdt(props.klage) ? (
                    <div>
                        <Label>{formatMessage('form.opprettholdVedtak.hjemmel.label')}</Label>
                        <div className={styles.hjemlerContainer}>
                            {props.klage.vedtaksvurdering.oppretthold.hjemler.map((hjemel) => (
                                <BodyShort key={hjemel}>{formatMessage(hjemel)}</BodyShort>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default OppsummeringAvKlage;
