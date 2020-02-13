import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
    accessToken: undefined,
    refreshToken: undefined
});

export const AuthContextProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(undefined);
    const [refreshToken, setRefreshToken] = useState(undefined);
    return (
        <AuthContext.Provider
            value={{
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
