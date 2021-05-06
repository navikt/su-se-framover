import Ikon from 'nav-frontend-ikoner-assets';
import { Element, Normaltekst } from 'nav-frontend-typografi';
import * as React from 'react';
import { Link } from 'react-router-dom';

import styles from './framdriftsindikator.module.less';

export enum Linjestatus {
    Ok,
    IkkeOk,
    Uavklart,
    Ingenting,
}

export interface Linje {
    id: string;
    status: Linjestatus;
    label: string;
    url: string;
    erKlikkbar: boolean;
}

export interface Seksjon {
    id: string;
    tittel: string;
    linjer: Linje[];
}

const erSeksjon = (arg: Linje | Seksjon): arg is Seksjon => 'tittel' in arg && 'linjer' in arg;

const Statusikon = (props: { status: Linjestatus; className: string }) => {
    const iconWidth = '24px';
    switch (props.status) {
        case Linjestatus.Ingenting:
            return <div style={{ width: iconWidth }} className={props.className}></div>;
        case Linjestatus.Uavklart:
            return <Ikon kind="advarsel-sirkel-fyll" width={iconWidth} className={props.className} />;
        case Linjestatus.IkkeOk:
            return <Ikon kind="feil-sirkel-fyll" width={iconWidth} className={props.className} />;
        case Linjestatus.Ok:
            return <Ikon kind="ok-sirkel-fyll" width={iconWidth} className={props.className} />;
    }
};

const Linjevisning = (props: { aktivId: string; linje: Linje }) => {
    const innmat = (
        <div className={styles.linje}>
            <Statusikon status={props.linje.status} className={styles.icon} />
            {props.linje.id === props.aktivId ? (
                <Element>{props.linje.label}</Element>
            ) : (
                <Normaltekst>{props.linje.label}</Normaltekst>
            )}
        </div>
    );
    return (
        <li>
            {props.linje.erKlikkbar ? (
                <Link to={props.linje.url} className={styles.link}>
                    {innmat}
                </Link>
            ) : (
                innmat
            )}
        </li>
    );
};

const Framdriftsindikator = (props: { elementer: Array<Linje | Seksjon>; aktivId: string }) => {
    return (
        <ol className={styles.container}>
            {props.elementer.map((e) =>
                erSeksjon(e) ? (
                    <li key={e.id}>
                        <Element className={styles.seksjonstittel}>{e.tittel}</Element>
                        <ol>
                            {e.linjer.map((l) => (
                                <Linjevisning key={l.id} aktivId={props.aktivId} linje={l} />
                            ))}
                        </ol>
                    </li>
                ) : (
                    <Linjevisning key={e.id} aktivId={props.aktivId} linje={e} />
                )
            )}
        </ol>
    );
};

export default Framdriftsindikator;
