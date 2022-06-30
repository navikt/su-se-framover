import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Link, Loader } from '@navikt/ds-react';
import React, { useEffect } from 'react';

import { ErrorCode } from '~src/api/apiClient';
import { LOGIN_URL } from '~src/api/authUrl';
import { FeatureToggle } from '~src/api/featureToggleApi';
import Header from '~src/components/header/Header';
import { UserProvider } from '~src/context/userContext';
import * as meSlice from '~src/features/me/me.slice';
import { useFeatureToggle } from '~src/lib/featureToggles';
import { pipe } from '~src/lib/fp';
import enableHotjar from '~src/lib/tracking/hotjar';
import { useAppDispatch, useAppSelector } from '~src/redux/Store';
import * as styles from '~src/root.module.less';
import { LoggedInUser } from '~src/types/LoggedInUser';

export const ContentWrapper: React.FC = (props) => {
    const loggedInUser = useAppSelector((s) => s.me.me);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (RemoteData.isInitial(loggedInUser)) {
            dispatch(meSlice.fetchMe());
        }
    }, [loggedInUser._tag]);

    const hotjarToggle = useFeatureToggle(FeatureToggle.Hotjar);
    useEffect(() => {
        hotjarToggle && enableHotjar();
    }, [hotjarToggle]);

    return (
        <div>
            <a href="#main-content" className="sr-only sr-only-focusable">
                Hopp til innhold
            </a>
            <Header
                user={pipe(
                    loggedInUser,
                    RemoteData.getOrElse<unknown, LoggedInUser | null>(() => null)
                )}
            />
            <main className={styles.contentContainer} id="main-content" tabIndex={-1}>
                {pipe(
                    loggedInUser,
                    RemoteData.fold(
                        () => <Loader />,
                        () => <Loader />,
                        (err) => {
                            return (
                                <div className={styles.ikkeTilgangContainer}>
                                    <Heading level="1" size="medium" className={styles.overskrift}>
                                        {err.statusCode === ErrorCode.NotAuthenticated ||
                                        err.statusCode === ErrorCode.Unauthorized
                                            ? 'Ikke tilgang'
                                            : 'En feil oppstod'}
                                    </Heading>
                                    <Link href={`${LOGIN_URL}?redirectTo=${window.location.pathname}`}>
                                        Logg inn på nytt
                                    </Link>
                                </div>
                            );
                        },
                        (u) => <UserProvider user={u}>{props.children}</UserProvider>
                    )
                )}
            </main>
        </div>
    );
};
