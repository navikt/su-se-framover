import React, {useContext, useEffect, useRef, useState} from 'react';
import { useConfig } from './useConfig';
import { useGet } from './useGet';
import { useAuthRedirect } from './useAuthRedirect';
import { AuthContext, AuthContextProvider } from './AuthContext';
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
            <TopBar/>
            <h1>Hello world!</h1>
            {isFetching ? "fetching" : <h2>{message}</h2>}
        </div>
    )
}


const søkeboksStyle = {
    marginLeft: '1em'
}

function Søkeboks(){
    const ref = useRef(null)

    function keyTyped(){

    }

    function search(value){
        console.log(value)
    }

    function userHitsEnterOnInputField(e) {
        if (e.key === 'Enter') {
            search(ref.current.value)
        }
    }

    return (
        <span>
            <input ref={ref} type="text" onKeyPress={keyTyped} onKeyDown={userHitsEnterOnInputField} />
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


function TopBar(){
    return (
        <div style={topBarStyle}>
            <span style={appNameStyle}>
                NAV Suse
            </span>
            <Søkeboks/>
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