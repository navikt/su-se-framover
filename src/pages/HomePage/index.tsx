import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import { useUserContext } from '~src/context/userContext';
import * as Routes from '~src/lib/routes';
import { Rolle } from '~src/types/LoggedInUser';

import * as styles from './homePage.module.less';

const HomePage = () => {
    const navigate = useNavigate();
    const user = useUserContext();
    const harTilgangTilDrift = user.roller.includes(Rolle.Drift);
    const harTilgangTilVeileder = user.roller.includes(Rolle.Veileder);
    const harTilgangTilSaksbehandler = user.roller.includes(Rolle.Saksbehandler);

    useEffect(() => {
        if (user.roller.length === 1 && user.roller[0] === Rolle.Veileder) {
            navigate(Routes.soknad.createURL(), { replace: true });
        } else if (user.roller.every((r) => [Rolle.Saksbehandler, Rolle.Attestant].includes(r))) {
            navigate(Routes.saksoversiktIndex.createURL(), { replace: true });
        } else if (user.roller.length === 1 && harTilgangTilDrift) {
            navigate(Routes.drift.createURL(), { replace: true });
        }
    }, [user]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Jeg er...</h1>
            <div className={styles.linkContainer}>
                {harTilgangTilVeileder && (
                    <LinkAsButton variant="secondary" href={Routes.soknad.createURL()} className={styles.link}>
                        Veileder
                    </LinkAsButton>
                )}
                {harTilgangTilSaksbehandler && (
                    <LinkAsButton
                        variant="secondary"
                        href={Routes.saksoversiktIndex.createURL()}
                        className={styles.link}
                    >
                        Saksbehandler
                    </LinkAsButton>
                )}
                {harTilgangTilDrift && (
                    <LinkAsButton variant="secondary" href={Routes.drift.createURL()} className={styles.link}>
                        Drift
                    </LinkAsButton>
                )}
            </div>
        </div>
    );
};

export default HomePage;
