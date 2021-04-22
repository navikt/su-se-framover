import React, { useState } from 'react';
import { createIntlCache, createIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import { SuccessNotificationState } from './routes';

export const useI18n = (args: { messages: Record<string, string> }) => {
    const intl = React.useMemo(() => {
        const cache = createIntlCache();
        return createIntl({ locale: 'nb-NO', messages: args.messages }, cache);
    }, [args.messages]);

    return intl;
};

export const useDocTitle = (title: string) => {
    React.useEffect(() => {
        document.title = `${title} – Supplerende Stønad`;
    }, [title]);
};

export const useNotificationFromLocation = () => {
    const [locationState, setLocationState] = useState<SuccessNotificationState | null>(null);
    const history = useHistory();
    const location = useLocation<SuccessNotificationState>();
    React.useEffect(() => {
        setLocationState(location.state);
        history.replace(location.pathname, null);
    }, []);
    return locationState;
};
