import { Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React from 'react';
import { Link } from 'react-router-dom';

import { useI18n } from '~lib/hooks';

import messages from './revurdering-nb';
import sharedStyles from './revurdering.module.less';

export const VisFeilmelding = (props: { forrigeURL: string }) => {
    const intl = useI18n({ messages });

    return (
        <div className={sharedStyles.revurderingContainer}>
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'oppsummering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                <div>
                    <Feilmelding className={sharedStyles.feilmelding}>
                        {intl.formatMessage({ id: 'revurdering.noeGikkGalt' })}
                    </Feilmelding>
                </div>
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={props.forrigeURL}>
                        {intl.formatMessage({ id: 'knapp.forrige' })}
                    </Link>
                </div>
            </div>
        </div>
    );
};
