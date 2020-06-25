import React from 'react';
import { Input } from 'nav-frontend-skjema';
import styles from '*.module.less';
import * as personSlice from '~features/person/person.slice';
import { useAppDispatch } from '~redux/Store';
import { useHistory } from 'react-router-dom';

const Søkefelt = () => {
    const dispatch = useAppDispatch();
    const [fnr, setFnr] = React.useState('');
    const history = useHistory();

    return (
        <Input
            className={styles.search}
            name="fnr"
            placeholder="Fødselsnummer"
            maxLength={11}
            onChange={(e) => setFnr(e.target.value)}
            onKeyDown={(e) => {
                if (e.keyCode === 13) {
                    dispatch(personSlice.fetchPerson({ fnr }));
                    setFnr('');
                    history.push('/saksoversikt');
                }
            }}
            value={fnr}
            mini
        />
    );
};

export default Søkefelt;
