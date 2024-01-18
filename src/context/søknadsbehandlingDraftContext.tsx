import debounce from 'lodash.debounce';
import {
    createContext,
    Dispatch,
    FC,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { FieldValues, UseFormWatch } from 'react-hook-form';

import { Vilkårtype } from '~src/types/Vilkårsvurdering';

type DraftKey = Vilkårtype | 'SendTilAttesteringPage';

type SøknadsbehandlingDraft = Record<DraftKey, Record<string, unknown> | undefined>;
type SøknadsbehandlingDraftContext = {
    value: SøknadsbehandlingDraft;
    setValue: Dispatch<SetStateAction<SøknadsbehandlingDraft>>;
};

const initialDraft = {} as SøknadsbehandlingDraft;
const Context = createContext<SøknadsbehandlingDraftContext>({
    value: initialDraft,
    setValue: () => {
        return;
    },
});

export const SøknadsbehandlingDraftProvider: FC<PropsWithChildren> = (props) => {
    const [value, setValue] = useState(initialDraft);
    return <Context.Provider value={{ value, setValue }}>{props.children}</Context.Provider>;
};

export const useSøknadsbehandlingDraftContext = () => {
    const { value } = useContext(Context);

    const isDraftDirty = useCallback((vilkårtype: Vilkårtype) => typeof value[vilkårtype] !== 'undefined', [value]);

    return { draft: value, isDraftDirty };
};

export const useSøknadsbehandlingDraftContextFor = <U extends FieldValues, T extends DraftKey = DraftKey>(
    vilkårtype: T,
    equalsInitialValues?: (values: U) => boolean,
) => {
    const { value, setValue } = useContext(Context);

    const setDraft = useCallback(
        debounce((data: U | undefined) => {
            setValue((v) => ({ ...v, [vilkårtype]: data && equalsInitialValues?.(data) ? undefined : data }));
        }, 800),
        [setValue],
    );

    const clearDraft = useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    const useDraftFormSubscribe = useCallback(
        (watch: UseFormWatch<U>) => {
            useEffect(() => {
                const sub = watch((values) => {
                    setDraft(values as U);
                });
                return () => sub.unsubscribe();
            }, [watch, setDraft]);
        },
        [setDraft],
    );

    return {
        draft: value[vilkårtype] as U | undefined,
        setDraft,
        clearDraft,
        useDraftFormSubscribe,
    };
};
