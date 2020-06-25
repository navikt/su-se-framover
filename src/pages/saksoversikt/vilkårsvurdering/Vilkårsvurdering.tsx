import React from 'react';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Undertittel } from 'nav-frontend-typografi';

import styles from './vilkårsvurdering.module.less';

const Vilkårsvurdering = (props: {
    title: string | React.ReactNode;
    icon: JSX.Element;
    children: React.ReactChild;
}) => {
    return (
        <Ekspanderbartpanel
            tittel={
                <div className={styles.tittel}>
                    {props.icon}
                    <Undertittel>{props.title}</Undertittel>
                </div>
            }
        >
            {props.children}
        </Ekspanderbartpanel>
    );
};

export default Vilkårsvurdering;
