import { hot } from 'react-hot-loader';
import React, { useContext, useEffect, useState } from 'react';
import { useConfig } from './hooks/useConfig';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { AuthContext, AuthContextProvider } from './contexts/AuthContext';
import { Innholdstittel } from 'nav-frontend-typografi';
import 'reset-css';
import Personinfo from "./pages/Personinfo"
import Soknad from './søknad/Soknad';
import Søkeboks from "./components/Søkeboks";
import Venstremeny from "./components/Venstremeny";
import Saker from './pages/Saker';
import Saksoversikt from './pages/Saksoversikt';
import Vilkarsprov from './pages/Vilkarsprov';
import Beregning from './pages/Beregning';
import ErrorBoundary from './components/ErrorBoundary';
import 'nav-frontend-tabell-style';
import './Root.less';
import { BrowserRouter as Router, Switch, Route, useLocation, useHistory } from 'react-router-dom';

const Root = () => {
    const { config } = useConfig();
    const [state, setState] = useState({
        vilkårsprøving: undefined,
        beregning: undefined
    });

    const updateVilkårsvurdering = nyeVilkår => {
        setState(state => ({
            ...state,
            vilkårsprøving: typeof nyeVilkår === 'function' ? nyeVilkår(state.vilkårsprøving) : nyeVilkår
        }));
    };

    useEffect(() => {
        console.log(state);
    }, [state]);

    const updateBeregning = nyBeregning => {
        setState(state => ({
            ...state,
            beregning: typeof nyBeregning === 'function' ? nyBeregning(state.beregning) : nyBeregning
        }));
    };

    return (
        <ErrorBoundary>
            <AuthContextProvider>
                <Router>
                    <ContentWrapper config={config}>
                        <Switch>
                            <Route path="/" exact>
                                <Main config={config} />
                            </Route>
                            <Route path="/person">
                                <Personinfo config={config} />
                            </Route>
                            <Route path="/auth/complete">
                                <AuthComplete />
                            </Route>
                            <Route path="/soknad">
                                <Soknad config={config} />
                            </Route>
                            <Route path="/saker">
                                <Saker />
                            </Route>
                            <Route path="/vilkarsprov">
                                <Vilkarsprov state={state.vilkårsprøving} setState={updateVilkårsvurdering} />
                            </Route>
                            <Route path="/saksoversikt">
                                <Saksoversikt />
                            </Route>
                            <Route path="/Beregning">
                                <Beregning state={state.beregning} setState={updateBeregning} />
                            </Route>
                        </Switch>
                    </ContentWrapper>
                </Router>
            </AuthContextProvider>
        </ErrorBoundary>
    );
};

function Main({ config }) {
    const url = config ? config.suSeBakoverUrl + '/authenticated' : undefined;
    const loginUrl = config ? config.suSeBakoverUrl + '/login' : undefined;
    const { data, isFetching } = useAuthRedirect({ url, loginUrl });
    const message = data ? data.data : 'this message unreadable';
    return (
        <div>
            <h1>Hello world!</h1>
            <br />
            {isFetching ? 'fetching' : <h2>{message}</h2>}
        </div>
    );
}

function ContentWrapper({ config, children }) {
    return (
        <div>
            <div style={ContentWrapperStyle}>
                <Innholdstittel style={appNameStyle}>NAV Suse</Innholdstittel>
                <Søkeboks config={config} />
            </div>
            <div style={{ display: 'flex' }}>
                <div>
                    <Venstremeny />
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}

function AuthComplete() {
    const location = useLocation();
    const { accessToken, setAccessToken } = useContext(AuthContext);
    const token = location.hash.replace('#', '');
    const history = useHistory();
    setAccessToken(token);
    useEffect(() => {
        if (accessToken !== undefined) {
            history.push('/');
        }
    }, [accessToken]);
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
