import { InformationFilled } from '@navikt/ds-icons';
import { BodyShort, Label, Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import {
    OppsummeringPar,
    OppsummeringsParSortering,
} from '~components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~lib/i18n';
import { Klage, KlageStatus, KlageVurderingType } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { erKlageOmgjort, erKlageOpprettholdt } from '~utils/klage/klageUtils';

import formkravMessages from '../../pages/klage/vurderFormkrav/vurderFormkrav-nb';
import vurderingMessages from '../../pages/klage/vurderingAvKlage/VurderingAvKlage-nb';
import * as DateUtils from '../../utils/date/dateUtils';

import oppsummeringMessages from './oppsummeringAvKlage-nb';
import styles from './oppsummeringAvKlage.module.less';

const OppsummeringAvKlage = (props: { klage: Klage; klagensVedtak: Vedtak }) => {
    const { formatMessage } = useI18n({
        messages: oppsummeringMessages,
    });

    const hentVurderingstekstId = (klage: Klage): keyof typeof oppsummeringMessages => {
        if (klage.vedtaksvurdering?.type === KlageVurderingType.OPPRETTHOLD) return 'label.vurdering.opprettholdt';
        else if (klage.vedtaksvurdering?.type === KlageVurderingType.OMGJØR) return 'label.vurdering.omgjort';
        else if (
            [KlageStatus.AVVIST, KlageStatus.TIL_ATTESTERING_AVVIST, KlageStatus.IVERKSATT_AVVIST].includes(
                klage.status
            )
        )
            return 'label.vurdering.avvist';

        return 'label.vurdering.ukjent';
    };

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
                    {props.klage.vedtaksvurdering && <VurderInfo klage={props.klage} />}
                </div>

                <div className={styles.vurdering}>
                    <InformationFilled className={styles.tag} />
                    <Heading size="xsmall" level="6">
                        {`${formatMessage('label.vurdering.tittel').toUpperCase()}: ${formatMessage(
                            hentVurderingstekstId(props.klage)
                        )}`}
                    </Heading>
                </div>
            </Oppsummeringspanel>
        </div>
    );
};

const KlageInfo = (props: { klage: Klage }) => {
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
                <OppsummeringPar
                    key={item.tittel}
                    label={item.tittel}
                    verdi={item.verdi}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
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
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('label.vedtak.type')}
                    verdi={props.klagensVedtak.type}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('label.vedtak.dato')}
                    verdi={DateUtils.formatDateTime(props.klagensVedtak.opprettet)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>

            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                    verdi={
                        props.klage.klagesDetPåKonkreteElementerIVedtaket
                            ? formatMessage('label.ja')
                            : formatMessage('label.nei')
                    }
                    sorteres={OppsummeringsParSortering.Vertikalt}
                    className={styles.tekstMaxBredde}
                />
                <OppsummeringPar
                    label={formatMessage('formkrav.innenforFrist.label')}
                    verdi={props.klage.innenforFristen && formatMessage(props.klage.innenforFristen)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
                <OppsummeringPar
                    label={formatMessage('formkrav.signert.label')}
                    verdi={props.klage.erUnderskrevet && formatMessage(props.klage.erUnderskrevet)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />
            </div>

            <OppsummeringPar
                label={formatMessage('formkrav.begrunnelse.label')}
                verdi={props.klage.begrunnelse}
                sorteres={OppsummeringsParSortering.Vertikalt}
                className={styles.formkravBegrunnelse}
            />
        </div>
    );
};

const VurderInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContentContainer}>
                <OppsummeringPar
                    label={formatMessage('form.vurdering.label')}
                    // Vurderingstypen skal finnes når man kommer til oppsummeringen
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    verdi={formatMessage(props.klage.vedtaksvurdering!.type)}
                    sorteres={OppsummeringsParSortering.Vertikalt}
                />

                {erKlageOmgjort(props.klage) ? (
                    <>
                        <OppsummeringPar
                            label={formatMessage('form.omgjørVedtak.årsak.label')}
                            verdi={formatMessage(props.klage.vedtaksvurdering.omgjør.årsak)}
                            sorteres={OppsummeringsParSortering.Vertikalt}
                        />
                        <OppsummeringPar
                            label={formatMessage('label.årsaksutfall')}
                            verdi={formatMessage(props.klage.vedtaksvurdering.omgjør.utfall)}
                            sorteres={OppsummeringsParSortering.Vertikalt}
                        />
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
