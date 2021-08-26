import { Edit } from '@navikt/ds-icons';
import React from 'react';
import { Link } from 'react-router-dom';

import { Person } from '~api/personApi';
import { useI18n } from '~lib/i18n';
import * as routes from '~lib/routes';
import { trackEvent } from '~lib/tracking/amplitude';
import { søknadOppsummeringEndreSvarKlikk } from '~lib/tracking/trackingEvents';
import { Søknadsteg } from '~pages/søknad/types';

import messages from '../Søknadoppsummering/søknadsoppsummering-nb';
import styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const EndreSvar = (props: { path: Søknadsteg; søker: Person }) => {
    const { intl } = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknadsutfylling.createURL({ step: props.path })}
            onClick={() => trackEvent(søknadOppsummeringEndreSvarKlikk({ ident: props.søker.aktorId }))}
        >
            <span className={styles.marginRight}>
                <Edit />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
