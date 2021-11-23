import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, BodyShort, Button, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import * as DateUtils from '~utils/date/dateUtils';

import formkravMessages from '../klage-nb';
import vurderingMessages from '../vurderingAvKlage/VurderingAvKlage-nb';

import oppsummeringMessages from './oppsummeringAvKlage-nb';
import styles from './oppsummeringAvKlage.module.less';

const OppsummeringAvKlage = (props: { sakId: string; klage: Klage; vedtaker: Vedtak[] }) => {
    const history = useHistory();
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    const [sendTilAttesteringStatus, sendtilAttestering] = useAsyncActionCreator(klageActions.sendTilAttestering);

    const handleSendTilAttesteringClick = () => {
        sendtilAttestering(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
            },
            () => {
                history.push(
                    Routes.createSakIntroLocation(formatMessage('notification.sendtTilAttestering'), props.sakId)
                );
            }
        );
    };

    const klagensVedtak = props.vedtaker.find((v) => v.id === props.klage.vedtakId);

    if (!klagensVedtak) {
        return (
            <div className={styles.fantIkkevedtakFeilContainer}>
                <Alert variant="error">{formatMessage('feil.fantIkkeVedtakForKlage')}</Alert>
                <Link
                    to={Routes.klage.createURL({
                        sakId: props.sakId,
                        klageId: props.klage.id,
                        steg: KlageSteg.Vurdering,
                    })}
                >
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.oppsummeringPage}>
            <div className={styles.oppsummeringPanelContainer}>
                <Oppsummeringspanel
                    tittel={formatMessage('oppsummering.heading')}
                    farge={Oppsummeringsfarge.Lilla}
                    ikon={Oppsummeringsikon.Liste}
                >
                    <div className={styles.panelInnholdContainer}>
                        <KlageInfo klage={props.klage} />
                        <FormkravInfo klage={props.klage} klagensVedtak={klagensVedtak} />
                        <VurderInfo klage={props.klage} />
                    </div>
                </Oppsummeringspanel>
            </div>
            <div className={styles.knappContainer}>
                <Button
                    variant="secondary"
                    onClick={() =>
                        history.push(
                            Routes.klage.createURL({
                                sakId: props.sakId,
                                klageId: props.klage.id,
                                steg: KlageSteg.Vurdering,
                            })
                        )
                    }
                >
                    {formatMessage('knapp.tilbake')}
                </Button>
                <Button variant="primary" onClick={() => handleSendTilAttesteringClick()}>
                    {formatMessage('knapp.sendTilAttestering')}
                </Button>
            </div>
            {RemoteData.isFailure(sendTilAttesteringStatus) && <ApiErrorAlert error={sendTilAttesteringStatus.error} />}
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
                    tittel: intl.formatMessage({ id: 'label.opprettet' }),
                    verdi: DateUtils.formatDateTime(props.klage.opprettet),
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
                    <BodyShort>
                        {props.klage.innenforFristen ? formatMessage('label.ja') : formatMessage('label.nei')}
                    </BodyShort>
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
                    <BodyShort>
                        {props.klage.erUnderskrevet ? formatMessage('label.ja') : formatMessage('label.nei')}
                    </BodyShort>
                </div>
            </div>

            <div className={styles.informasjonsContainerContent}>
                <div>
                    <Label>{formatMessage('formkrav.begrunnelse.label')}</Label>
                    <BodyShort>{props.klage.begrunnelse}</BodyShort>
                </div>
            </div>
        </div>
    );
};

const VurderInfo = (props: { klage: Klage }) => {
    const { formatMessage } = useI18n({
        messages: { ...oppsummeringMessages, ...formkravMessages, ...vurderingMessages },
    });

    console.log(props.klage);

    return (
        <div className={styles.informasjonsContainer}>
            <div className={styles.informasjonsContainerContent}>
                <div>
                    <Label>{formatMessage('form.vurdering.label')}</Label>
                    <BodyShort>TODO</BodyShort>
                </div>

                <div>
                    <Label>{formatMessage('form.omgjørVedtak.årsak.label')}</Label>
                    <BodyShort>TODO</BodyShort>
                </div>
                <div>
                    <Label>{formatMessage('label.årsaksutfall')}</Label>
                    <BodyShort>TODO</BodyShort>
                </div>
                <div>
                    <Label>{formatMessage('form.opprettholdVedtak.hjemmel.label')}</Label>
                    <BodyShort>TODO</BodyShort>
                </div>
            </div>
        </div>
    );
};

export default OppsummeringAvKlage;
