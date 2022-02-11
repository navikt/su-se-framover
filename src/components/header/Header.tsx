import { Dropdown, Header } from '@navikt/ds-react-internal';
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
                        <Header.Title
                            href={Routes.soknadPersonSøk.createURL({
                                papirsøknad: true,
                            })}
                        >
                            {intl.formatMessage({ id: 'link.papirsøknad' })}
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
                                <Dropdown.Menu.List.Item
                                    onClick={() => {
                                        window.location.href = Config.LOGOUT_URL;
                                    }}
                                >
                                    Logg ut
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
