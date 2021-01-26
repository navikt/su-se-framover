import NavHeader from '@navikt/nap-header';
import Lenke from 'nav-frontend-lenker';
import React from 'react';

import Config from '~/config';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { LoggedInUser, Rolle } from '~types/LoggedInUser';

import messages from './header-nb';
import styles from './header.module.less';
import Menyknapp from './Menyknapp';

interface Props {
    user: LoggedInUser | null;
}

const Header = (props: Props) => {
    const i18n = useI18n({ messages });
    return (
        <NavHeader title={i18n.formatMessage({ id: 'title' })} titleHref={'/'}>
            {props.user && (
                <div className={styles.content}>
                    {props.user.roller.includes(Rolle.Saksbehandler) && (
                        <Lenke
                            href={Routes.soknad.createURL({ step: null, papirsøknad: true })}
                            className={styles.papirsoknad}
                        >
                            {i18n.formatMessage({ id: 'link.papirsøknad' })}
                        </Lenke>
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
