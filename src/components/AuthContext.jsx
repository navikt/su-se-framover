import React, {createContext, useState} from 'react';

export const AuthContext = createContext({
    accessToken: undefined
})

export const AuthContextProvider = ({children}) => {
    const [accessToken, setAccessToken] = useState(undefined)
    return (
        <AuthContext.Provider value={{
            accessToken, setAccessToken
        }}>
        {children}
        </AuthContext.Provider>
    )
}