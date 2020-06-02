import React from 'react';
import 'nav-frontend-tabell-style';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory } from 'react-router-dom';
import { useGet } from '../hooks/useGet';

function Saker() {
    const history = useHistory();

    const url = '/sak/list';
    const { data } = useGet({ url });
    const saker = data ? data : [];
    return (
        <div style={{ width: '40%' }}>
            <table className="tabell">
                <thead>
                    <tr>
                        <th role="columnheader" aria-sort="none">
                            <Lenke href="#">Sak</Lenke>
                        </th>
                        <th role="columnheader" aria-sort="none">
                            <Lenke href="#">Fnr</Lenke>
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {saker.map((sak, index) => {
                        return (
                            <tr key={index}>
                                <td>{sak.id}</td>
                                <td>{sak.fnr}</td>
                                <td>
                                    <Hovedknapp onClick={() => history.push('/saksoversikt', saker[index])}>
                                        {'Behandle'}
                                    </Hovedknapp>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Saker;
