import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { UserProvider } from '~src/context/userContext';
import { LoggedInUser, Rolle } from '~src/types/LoggedInUser';

import HomePage from './index';

const renderStartside = (roller: Rolle[]) => {
    const user: LoggedInUser = {
        navn: 'Testbruker',
        navIdent: 'Z999999',
        roller,
        isProd: false,
    };

    return renderToStaticMarkup(
        <MemoryRouter>
            <UserProvider user={user}>
                <HomePage />
            </UserProvider>
        </MemoryRouter>,
    );
};

describe('Rollevalg på startsiden', () => {
    it('viser bare statistikkinngangen for statistikkrollen', () => {
        const markup = renderStartside([Rolle.Statistikk]);

        expect(markup).toContain('Statistikk');
        expect(markup).not.toContain('Drift');
        expect(markup).not.toContain('Saksbehandler');
        expect(markup).not.toContain('Veileder');
    });

    it('viser både drift og statistikk når brukeren har begge rollene', () => {
        const markup = renderStartside([Rolle.Drift, Rolle.Statistikk]);

        expect(markup).toContain('Drift');
        expect(markup).toContain('Statistikk');
    });

    it('viser saksbehandlingsinngangen for attestant med statistikkrollen', () => {
        const markup = renderStartside([Rolle.Attestant, Rolle.Statistikk]);

        expect(markup).toContain('Saksbehandler');
        expect(markup).toContain('Statistikk');
    });

    it('viser ikke statistikkinngangen uten statistikkrollen', () => {
        const markup = renderStartside([Rolle.Drift]);

        expect(markup).toContain('Drift');
        expect(markup).not.toContain('Statistikk');
    });
});
