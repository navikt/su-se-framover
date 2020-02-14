import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
    accessToken: undefined,
    refreshToken: undefined
});

export const AuthContextProvider = ({ children, value = {} }) => {
    const [accessToken, setAccessToken] = useState(value.accessToken);
    const [refreshToken, setRefreshToken] = useState(value.refreshToken);
    return (
        <AuthContext.Provider
            value={{
                ...value,
                accessToken,
                setAccessToken,
                refreshToken,
                setRefreshToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
