import { Edit } from '@navikt/ds-icons';
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import * as routes from '~src/lib/routes';
import { SøknadContext } from '~src/pages/søknad';
import { Søknadssteg } from '~src/pages/søknad/types';

import messages from '../Søknadoppsummering/søknadsoppsummering-nb';
import * as styles from '../Søknadoppsummering/søknadsoppsummering.module.less';

export const EndreSvar = (props: { path: Søknadssteg }) => {
    const { sakstype: soknadstema } = useOutletContext<SøknadContext>();
    const { intl } = useI18n({ messages });
    return (
        <Link
            className={styles.endreSvarContainer}
            to={routes.soknadsutfylling.createURL({ step: props.path, soknadstema })}
        >
            <span className={styles.marginRight}>
                <Edit />
            </span>
            <span>{intl.formatMessage({ id: 'oppsummering.endreSvar' })}</span>
        </Link>
    );
};
