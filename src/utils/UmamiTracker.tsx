import { Head } from '@unhead/react';

import { useAppSelector } from '~src/redux/Store';

const UmamiTracker = () => {
    const umamiConfig = useAppSelector((state) => state.frontendConfig.config.umami);

    if (!umamiConfig) return null;

    return (
        <Head>
            <script
                defer
                src={umamiConfig.scriptUrl}
                data-host-url={umamiConfig.hostUrl}
                data-website-id={umamiConfig.websiteId}
            />
        </Head>
    );
};

export default UmamiTracker;
