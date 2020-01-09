import React, {useContext, useEffect} from 'react';
import { useConfig } from './useConfig';
import { useGet } from './useGet';
import { useAuthRedirect } from './useAuthRedirect';
import { AuthContext, AuthContextProvider } from './AuthContext';
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
            <h1>Hello world!</h1>
            {isFetching ? "fetching" : <h2>{message}</h2>}
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