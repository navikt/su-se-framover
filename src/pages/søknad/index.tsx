import * as React from 'react';

import { useAppDispatch } from '~redux/Store';
import * as saksoversiktSlice from '../../features/saksoversikt/saksoversikt.slice';
import styles from './index.module.less';
import Inngang from './inngang';

const index = () => {
    return (
        <div className={styles.container}>
            <div>
                <h1>tempt-tittel</h1>
            </div>
            <Inngang />
        </div>
    );
};

export default index;
