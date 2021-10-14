import { Header } from '@navikt/ds-react-internal';
import React from 'react';

import Config from '~/config';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { LoggedInUser, Rolle } from '~types/LoggedInUser';

import messages from './header-nb';

interface Props {
    user: LoggedInUser | null;
}

const SuHeader = (props: Props) => {
    const { intl } = useI18n({ messages });
    return (
        <Header>
            <Header.Title href="/" style={{ marginRight: 'auto' }}>
                {intl.formatMessage({ id: 'title' })}
            </Header.Title>
            {props.user && (
                <>
                    {props.user.roller.includes(Rolle.Saksbehandler) && (
                        <>
                            <Header.Title href={Routes.nøkkeltall.createURL()}>
                                {intl.formatMessage({ id: 'link.nøkkeltall' })}
                            </Header.Title>
                            <Header.Title
                                href={Routes.soknadPersonSøk.createURL({
                                    papirsøknad: true,
                                })}
                            >
                                {intl.formatMessage({ id: 'link.papirsøknad' })}
                            </Header.Title>
                        </>
                    )}
                    <Header.Dropdown>
                        <Header.Dropdown.UserButton name={props.user.navn} description={props.user.navIdent} />
                        <Header.Dropdown.Menu>
                            <Header.Dropdown.Menu.Item
                                onClick={() => {
                                    window.location.href = Config.LOGOUT_URL;
                                }}
                            >
                                Logg ut
                            </Header.Dropdown.Menu.Item>
                        </Header.Dropdown.Menu>
                    </Header.Dropdown>
                </>
            )}
        </Header>
    );
};

export default SuHeader;
