import debounce from 'lodash.debounce';
import React, { createContext, useContext, useState } from 'react';
import { UseFormWatch } from 'react-hook-form';

import { Vilkårtype } from '~types/Vilkårsvurdering';

type DraftKey = Vilkårtype | 'SendTilAttesteringPage';

type SøknadsbehandlingDraft = Record<DraftKey, Record<string, unknown> | undefined>;
type SøknadsbehandlingDraftContext = {
    value: SøknadsbehandlingDraft;
    setValue: React.Dispatch<React.SetStateAction<SøknadsbehandlingDraft>>;
};

const initialDraft = {} as SøknadsbehandlingDraft;
const Context = createContext<SøknadsbehandlingDraftContext>({
    value: initialDraft,
    setValue: () => {
        return;
    },
});

export const SøknadsbehandlingDraftProvider: React.FC = (props) => {
    const [value, setValue] = useState(initialDraft);
    return <Context.Provider value={{ value, setValue }}>{props.children}</Context.Provider>;
};

export const useSøknadsbehandlingDraftContext = () => {
    const { value } = useContext(Context);

    const isDraftDirty = React.useCallback(
        (vilkårtype: Vilkårtype) => typeof value[vilkårtype] !== 'undefined',
        [value]
    );

    return { draft: value, isDraftDirty };
};

export const useSøknadsbehandlingDraftContextFor = <U, T extends DraftKey = DraftKey>(
    vilkårtype: T,
    equalsInitialValues?: (values: U) => boolean
) => {
    const { value, setValue } = useContext(Context);

    const setDraft = React.useCallback(
        debounce((data: U | undefined) => {
            setValue((v) => ({ ...v, [vilkårtype]: data && equalsInitialValues?.(data) ? undefined : data }));
        }, 800),
        [setValue]
    );

    const clearDraft = React.useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    const useDraftFormSubscribe = React.useCallback(
        (watch: UseFormWatch<U>) => {
            React.useEffect(() => {
                const sub = watch((values) => {
                    setDraft(values as U);
                });
                return () => sub.unsubscribe();
            }, [watch, setDraft]);
        },
        [setDraft]
    );

    return { draft: value[vilkårtype] as U | undefined, setDraft, clearDraft, useDraftFormSubscribe };
};
