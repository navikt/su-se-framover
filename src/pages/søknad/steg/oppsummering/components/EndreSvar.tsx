import React from 'react';
import { Link } from 'react-router-dom';

import { Person } from '~api/personApi';
import { PencilIcon } from '~assets/Icons';
import { useI18n } from '~lib/hooks';
import * as routes from '~lib/routes';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadOppsummeringEndreSvarKlikk } from '~lib/tracking/trackingEvents';
import { Søknadsteg } from '~pages/søknad/types';

import messages from '../Søknadoppsummering/oppsummering-nb';
import styles from '../Søknadoppsummering/oppsummering.module.less';

export const EndreSvar = (props: { path: Søknadsteg; søker: Person }) => {
    const intl = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknadsutfylling.createURL({ step: props.path })}
            onClick={() => trackEvent(søknadOppsummeringEndreSvarKlikk({ ident: props.søker.aktorId }))}
        >
            <span className={styles.marginRight}>
                <PencilIcon width="15" height="15" />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
