import React, { useState, createContext, useContext } from 'react';

export const defaultValue = {
    isAttestant: false,
    setIsAttestant: () => undefined,
};
type UserContext = {
    isAttestant: boolean;
    setIsAttestant: React.Dispatch<React.SetStateAction<UserContext>>;
};
const UserContext = createContext<UserContext>(defaultValue);

export const UserProvider = (props: { children: React.ReactNode }) => {
    const [value, setValue] = useState<UserContext>(defaultValue);
    return (
        <UserContext.Provider
            value={{
                isAttestant: value.isAttestant,
                setIsAttestant: setValue,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
};

const useUserContext = () => useContext(UserContext);
export default useUserContext;
