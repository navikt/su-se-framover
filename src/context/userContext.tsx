import React, { createContext, useContext } from 'react';

import { LoggedInUser, Rolle } from '../types/LoggedInUser';

type UserContext = LoggedInUser & {
    isAttestant: boolean;
};

/*
Vi trikser litt her ved å bruke `{}` som initiell verdi.
Siden `UserProvider` tar inn brukeren som prop, vil vi dermed alltid ha den tilgjengelig
i alle barn av `UserProvider`, noe som gjør at vi slipper å nullsjekke overalt hvor vi vil bruke den.
Dette fordrer da at vi aldri rendrer noen komponenter som bruker `UserContext` uten at
`UserProvider` er satt opp.
*/
const UserContext = createContext<UserContext>({} as UserContext);
UserContext.displayName = 'UserContext';

export const UserProvider: React.FC<{ user: LoggedInUser }> = (props) => {
    return (
        <UserContext.Provider
            value={{
                ...props.user,
                isAttestant: props.user.roller.includes(Rolle.Attestant),
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);
