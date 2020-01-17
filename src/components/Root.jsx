import React, {useContext, useEffect, useRef, useState} from 'react';
import { useConfig } from './useConfig';
import { useGet } from './useGet';
import { useAuthRedirect } from './useAuthRedirect';
import { AuthContext, AuthContextProvider } from './AuthContext';
import { Normaltekst, Innholdstittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import 'reset-css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
  useHistory
} from "react-router-dom";

const Root = () => {
    const { config } = useConfig();
    return (
    <AuthContextProvider>
    <Router>
        <Switch>
            <Route path="/" exact>
                <Main config={config}/>
            </Route>
            <Route path="/person">
                <Person config={config}/>
            </Route>
            <Route path="/auth/complete">
                <AuthComplete/>
            </Route>
        </Switch>
    </Router>
    </AuthContextProvider>
    )
};

function Main({config}){
    const url = config ? config.suSeBakoverUrl + "/authenticated" : undefined;
    const loginUrl = config ? config.suSeBakoverUrl + "/login" : undefined;
    const { data, isFetching } = useAuthRedirect({ url, loginUrl });
    const message = data ? data.data : "this message unreadable";
    return (
        <div>
            <TopBar config={config} />
            <h1>Hello world!</h1>
            {isFetching ? "fetching" : <h2>{message}</h2>}
        </div>
    )
}

function Person({config}){
    const history = useHistory();
    const {firstName, lastName} = history.location.state
    return (
        <div>
            <TopBar config={config} />
            <Panel>
            <Panel border>
            	<div><Normaltekst tag="span">Fornavn: </Normaltekst><Normaltekst tag="span">{firstName}</Normaltekst></div>
            	<div><Normaltekst tag="span">Etternavn: </Normaltekst><Normaltekst tag="span">{lastName}</Normaltekst></div>
            </Panel>
            </Panel>
        </div>
    )
}


const søkeboksStyle = {
    marginLeft: '1em'
}

function Søkeboks({config}){
    const ref = useRef(null)
    const [url, setUrl] = useState(undefined)
    const {data} = useGet({url})
    const history = useHistory();

    useEffect(() => {
        if(data !== undefined){
            history.push("/person", data)
        }
    }, [data])

    function search(value){
        const searchUrl = config.suSeBakoverUrl + "/person?ident=" + value;

        setUrl(searchUrl);
    }

    function keyTyped(e) {
        if (e.key === 'Enter') {
            search(ref.current.value)
        }
    }

    return (
        <span>
            <input ref={ref} type="text" onKeyDown={keyTyped} />
            <button style={søkeboksStyle} onClick={() => search(ref.current.value)} >Søk</button>
        </span>
    )
}




const topBarStyle = {
    backgroundColor: '#3E3832',
    color: 'white',
    height: '3em',
    display: 'flex',
    alignItems: 'center'

}

const appNameStyle = {
    marginRight: '2em',
    marginLeft: '1em'
}


function TopBar({config}){
    return (
        <div style={topBarStyle}>
            <Innholdstittel style={appNameStyle}>
                NAV Suse
            </Innholdstittel>
            <Søkeboks config={config}/>
        </div>
    )
}

function AuthComplete() {
    const location = useLocation()
    const {accessToken, setAccessToken} = useContext(AuthContext)
    const token = location.hash.replace("#","")
    const history = useHistory();
    setAccessToken(token)
    useEffect(() => {
        if(accessToken !== undefined){
            history.push("/")
        }
    }, [accessToken])
    return null
}







export default Root;