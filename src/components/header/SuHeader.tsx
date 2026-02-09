import { Dropdown, InternalHeader } from '@navikt/ds-react';

import { LOGOUT_URL } from '~src/api/authUrl';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { LoggedInUser, Rolle } from '~src/types/LoggedInUser';

import messages from './SuHeader-nb';

interface Props {
    user: LoggedInUser | null;
}

const SuHeader = (props: Props) => {
    const isLocal = process.env.NODE_ENV === 'development';

    const { formatMessage } = useI18n({ messages });
    return (
        <InternalHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
                <InternalHeader.Title href="/">{formatMessage('title')}</InternalHeader.Title>
                {isLocal && <InternalHeader.Title href="/saksoversikt">Til saksoversikt (local)</InternalHeader.Title>}
                {isLocal && (
                    <InternalHeader.Title href={Routes.devTools.createURL()}>Dev tools (local)</InternalHeader.Title>
                )}
            </div>
            {props.user && (
                <div style={{ display: 'flex' }}>
                    {props.user.roller.includes(Rolle.Saksbehandler) && (
                        <InternalHeader.Title
                            href={Routes.soknadtema.createURL({
                                papirsøknad: true,
                            })}
                        >
                            {formatMessage('link.papirsøknad')}
                        </InternalHeader.Title>
                    )}
                    <Dropdown>
                        <InternalHeader.UserButton
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
        </InternalHeader>
    );
};

export default SuHeader;
