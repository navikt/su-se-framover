import React from 'react';
import { useGet } from '../hooks/useGet';
import Tekstomrade from 'nav-frontend-tekstomrade';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

function SoknadVis() {
    const location = useLocation();
    const values = location.search ? queryString.parse(location.search) : null;
    const sakId = values ? values.sak : '';
    const url = sakId ? '/sak/' + sakId + '/soknad' : null;
    const { data } = url ? useGet({ url }) : {};
    const soknad = data ? JSON.stringify(data) : '';
    return (
        <>
            <Tekstomrade>{soknad}</Tekstomrade>
        </>
    );
}

export default SoknadVis;
