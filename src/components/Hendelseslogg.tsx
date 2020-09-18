import { format } from 'date-fns';
import { Element, Undertekst } from 'nav-frontend-typografi';
import React from 'react';

import { findBehandling } from '~features/behandling/behandlingUtils';
import * as Routes from '~lib/routes';
import { Hendelse } from '~types/Behandling';
import { Sak } from '~types/Sak';

import styles from './hendelseslogg.module.less';

type Props = {
    sak: Sak;
};
const Hendelseslogg = ({ sak }: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.saksoversiktValgtBehandling>();
    const behandling = findBehandling(sak, urlParams.behandlingId);

    return (
        <div className={styles.hendelseslogg}>
            {behandling?.hendelser?.length ? (
                behandling.hendelser.map((hendelse, index) => <Hendelse key={index} hendelse={hendelse} />)
            ) : (
                <div> inge hendelser nå</div>
            )}
        </div>
    );
};

const Hendelse = (props: { hendelse: Hendelse }) => {
    const { overskrift, melding, tidspunkt } = props.hendelse;

    return (
        <div className={styles.hendelse}>
            <div className={styles.connection}>
                <div className={styles.circle} />
                <div className={styles.dottedLine} />
            </div>
            <div className={styles.content}>
                <Element>{overskrift}</Element>
                <Undertekst className={styles.undertekst}>{format(new Date(tidspunkt), 'dd.MM.yyyy')}</Undertekst>
                <p className={styles.melding}>{melding}</p>
            </div>
        </div>
    );
};

export default Hendelseslogg;
