import { Edit } from '@navikt/ds-icons';
import React from 'react';
import { Link } from 'react-router-dom';

import { Person } from '~src/api/personApi';
import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { trackEvent } from '~src/lib/tracking/amplitude';
import { søknadOppsummeringEndreSvarKlikk } from '~src/lib/tracking/trackingEvents';
import { Søknadsteg } from '~src/pages/søknad/types';

import messages from '../Søknadoppsummering/søknadsoppsummering-nb';
import * as styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

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
