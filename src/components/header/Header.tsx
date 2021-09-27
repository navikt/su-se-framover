import { Link } from '@navikt/ds-react';
import NavHeader from '@navikt/nap-header';
import React from 'react';

import Config from '~/config';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { LoggedInUser, Rolle } from '~types/LoggedInUser';

import messages from './header-nb';
import styles from './header.module.less';
import Menyknapp from './Menyknapp';

interface Props {
    user: LoggedInUser | null;
}

const Header = (props: Props) => {
    const { intl } = useI18n({ messages });
    return (
        <NavHeader title={intl.formatMessage({ id: 'title' })} titleHref={'/'}>
            {props.user && (
                <div className={styles.content}>
                    {props.user.roller.includes(Rolle.Saksbehandler) && (
                        <Link
                            href={Routes.soknadPersonSøk.createURL({
                                papirsøknad: true,
                            })}
                            className={styles.papirsoknad}
                        >
                            {intl.formatMessage({ id: 'link.papirsøknad' })}
                        </Link>
                    )}
                    <Menyknapp
                        navn={props.user.navn}
                        onLoggUtClick={() => {
                            window.location.href = Config.LOGOUT_URL;
                        }}
                    />
                </div>
            )}
        </NavHeader>
    );
};

export default Header;
