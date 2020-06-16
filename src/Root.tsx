import { hot } from 'react-hot-loader';
import React, { useEffect } from 'react';
import { Innholdstittel } from 'nav-frontend-typografi';
import 'reset-css';
import ErrorBoundary from './components/ErrorBoundary';
import 'nav-frontend-tabell-style';
import './Root.less';
import { BrowserRouter as Router, Switch, Route, useLocation, useHistory } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from './redux/Store';
import Soknad from './pages/søknad';
import apiClient from '~/api/apiClient';
import * as Cookies from './lib/cookies';
import HomePage from '~pages/HomePage';

const Root = () => {
    useEffect(() => {
        if (!window.BASE_URL || typeof window.BASE_URL !== 'string') {
            fetch('/config.json').then(res => {
                if (res.ok) {
                    res.json().then(config => {
                        window.BASE_URL = config.suSeBakoverUrl;
                    });
                } else {
                    console.error('could not get config', res.statusText);
                }
            });
        }
    }, [window.BASE_URL]);

    useEffect(() => {
        if (!window.BASE_URL || typeof window.BASE_URL !== 'string') {
            return;
        }
        apiClient('/authenticated', { method: 'GET' });
    }, [window.BASE_URL]);

    return (
        <Provider store={Store}>
            <ErrorBoundary>
                <Router>
                    <ContentWrapper>
                        <Switch>
                            <Route path="/" exact>
                                <HomePage />
                            </Route>
                            <Route path="/soknad/:step">
                                <Soknad />
                            </Route>
                            <Route path="/auth/complete">
                                <AuthComplete />
                            </Route>
                            <Route>404</Route>
                        </Switch>
                    </ContentWrapper>
                </Router>
            </ErrorBoundary>
        </Provider>
    );
};

function ContentWrapper({ children }: { children: React.ReactChild }) {
    return (
        <div>
            <div style={ContentWrapperStyle}>
                <Innholdstittel style={appNameStyle}>NAV Suse</Innholdstittel>
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ width: '100%', minHeight: '100vh' }}>{children}</div>
            </div>
        </div>
    );
}

function AuthComplete() {
    const location = useLocation();
    const tokens = location.hash.split('#');
    const accessToken = tokens[1];
    const refreshToken = tokens[2];
    const history = useHistory();

    Cookies.set(Cookies.CookieName.AccessToken, accessToken);
    Cookies.set(Cookies.CookieName.RefreshToken, refreshToken);

    useEffect(() => {
        if (accessToken !== undefined) {
            history.push('/');
        }
    }, [accessToken, refreshToken]);
    return null;
}

const ContentWrapperStyle = {
    backgroundColor: '#3E3832',
    color: 'white',
    height: '3em',
    display: 'flex',
    alignItems: 'center'
};

const appNameStyle = {
    marginRight: '2em',
    marginLeft: '1em'
};

/* eslint-disable-next-line no-undef */
export default hot(module)(Root);
