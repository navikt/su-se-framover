import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';

import Søknadsbehandlingoppsummering from '~components/søknadsbehandlingoppsummering/Søknadsbehandlingoppsummering';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import messages from './søknadsbehandlingvedtakoppsummering-nb';
import styles from './søknadsbehandlingvedtakoppsummering.module.less';

interface Props {
    sak: Sak;
}

const Søknadsbehandlingvedtakoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = props.sak.behandlinger.find((behandling) => behandling.id === urlParams.behandlingId);
    const vedtakForBehandling = props.sak.vedtak.find((v) => v.behandlingId === behandling?.id);
    const { intl } = useI18n({ messages });

    if (!behandling) {
        return <></>;
    }

    return (
        <div className={styles.oppsummeringContainer}>
            <Søknadsbehandlingoppsummering
                sak={props.sak}
                behandling={behandling}
                vedtakForBehandling={vedtakForBehandling}
                medBrevutkastknapp
            />

            <div className={styles.tilbakeLinkContainer}>
                <Link
                    to={Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sak.id,
                    })}
                    className={classNames('knapp', styles.backButton)}
                >
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Link>
            </div>
        </div>
    );
};

export default Søknadsbehandlingvedtakoppsummering;
