import * as RemoteData from '@devexperts/remote-data-ts';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Element } from 'nav-frontend-typografi';
import React, { useState } from 'react';

import { ApiError } from '~api/apiClient';
import { useUserContext } from '~context/userContext';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import messages from './vedtaksoppsummering-nb';
import styles from './vedtaksoppsummering.module.less';

interface Props {
    sak: Sak;
}
const Vedtaksoppsummering = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.vedtaksoppsummering>();
    const intl = useI18n({ messages });
    const user = useUserContext();
    const [lastNedBrevStatus, setLastNedBrevStatus] = useState<RemoteData.RemoteData<ApiError, null>>(
        RemoteData.initial
    );
    const vedtak = props.sak.vedtak.find((v) => v.id === urlParams.vedtakId);
    if (!vedtak) return <div>lol wtf</div>;

    const Tilleggsinfo = () => {
        return (
            <div>
                <div className={styles.tilleggsinfoContainer}>
                    <div>
                        <Element>{intl.formatMessage({ id: 'vurdering.tittel' })}</Element>
                        <p>{'status tekst here'}</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandlet.av' })}</Element>
                        <p>{vedtak.saksbehandler || user.navn}</p>
                    </div>

                    <div>
                        <Element> {intl.formatMessage({ id: 'attestert.av' })}</Element>
                        <p>{vedtak.attestant}</p>
                    </div>

                    <div>
                        <Element> {intl.formatMessage({ id: 'behandling.søknadsdato' })}</Element>
                        <p>søknadsdato</p>
                    </div>
                    <div>
                        <Element> {intl.formatMessage({ id: 'behandling.saksbehandlingsdato' })}</Element>
                        <p>saksbehandlingsdato</p>
                    </div>
                    <div>
                        <Element>{intl.formatMessage({ id: 'brev.utkastVedtaksbrev' })}</Element>
                        <Knapp
                            spinner={RemoteData.isPending(lastNedBrevStatus)}
                            mini
                            htmlType="button"
                            onClick={() => setLastNedBrevStatus(RemoteData.pending)}
                        >
                            {intl.formatMessage({ id: 'knapp.vis' })}
                        </Knapp>
                    </div>
                </div>
                <div className={styles.brevutkastFeil}>
                    {RemoteData.isFailure(lastNedBrevStatus) && (
                        <AlertStripeFeil>
                            {lastNedBrevStatus.error.body?.message ??
                                intl.formatMessage({ id: 'feilmelding.ukjentFeil' })}
                        </AlertStripeFeil>
                    )}
                </div>
            </div>
        );
    };
    return (
        <div>
            <Element> Oppsummering av vedtak</Element>
            <Tilleggsinfo />
        </div>
    );
};

export default Vedtaksoppsummering;
