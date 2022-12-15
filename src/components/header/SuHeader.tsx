import { Dropdown, Header } from '@navikt/ds-react-internal';
import React from 'react';

import { LOGOUT_URL } from '~src/api/authUrl';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { LoggedInUser, Rolle } from '~src/types/LoggedInUser';

import messages from './SuHeader-nb';

interface Props {
    user: LoggedInUser | null;
}

//TODO - lag classnames etc

const SuHeader = (props: Props) => {
    const isLocal = process.env.NODE_ENV === 'development';

    const { formatMessage } = useI18n({ messages });
    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
                <Header.Title href="/">{formatMessage('title')}</Header.Title>
                {isLocal && <Header.Title href="/saksoversikt">Til saksoversikt (local)</Header.Title>}
                {isLocal && <Header.Title href={Routes.devTools.createURL()}>Dev tools (local)</Header.Title>}
            </div>
            {props.user && (
                <div style={{ display: 'flex' }}>
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
                </div>
            )}
        </Header>
    );
};

export default SuHeader;
