import { Dropdown, Header } from '@navikt/ds-react-internal';
import React from 'react';

import { LOGOUT_URL } from '~src/api/authUrl';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { LoggedInUser, Rolle } from '~src/types/LoggedInUser';

import messages from './header-nb';

interface Props {
    user: LoggedInUser | null;
}

const SuHeader = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    return (
        <Header>
            <Header.Title href="/" style={{ marginRight: 'auto' }}>
                {formatMessage('title')}
            </Header.Title>
            {props.user && (
                <>
                    {props.user.roller.includes(Rolle.Saksbehandler) && (
                        <Header.Title
                            href={Routes.soknadtema.createURL({
                                papirsøknad: true,
                            })}
                        >
                            {formatMessage('link.papirsøknad')}
                        </Header.Title>
                    )}
                    <Dropdown>
                        <Header.UserButton
                            as={Dropdown.Toggle}
                            name={props.user.navn}
                            description={props.user.navIdent}
                        />
                        <Dropdown.Menu>
                            <Dropdown.Menu.List>
                                <Dropdown.Menu.List.Item>
                                    <a href={LOGOUT_URL}>Logg ut</a>
                                </Dropdown.Menu.List.Item>
                            </Dropdown.Menu.List>
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            )}
        </Header>
    );
};

export default SuHeader;
