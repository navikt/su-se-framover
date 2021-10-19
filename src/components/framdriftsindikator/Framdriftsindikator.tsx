import { SuccessFilled, ErrorFilled, HelptextFilled, Notes } from '@navikt/ds-icons';
import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';

import styles from './framdriftsindikator.module.less';

export enum Linjestatus {
    Ok,
    IkkeOk,
    Uavklart,
    Ingenting,
    Uferdig,
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

const Statusikon = (props: { status: Linjestatus }) => {
    const [className, Ikon] = React.useMemo(() => {
        switch (props.status) {
            case Linjestatus.Ingenting:
                return [null, null];
            case Linjestatus.Uavklart:
                return [styles.iconYellow, HelptextFilled];
            case Linjestatus.IkkeOk:
                return [styles.iconRed, ErrorFilled];
            case Linjestatus.Ok:
                return [styles.iconGreen, SuccessFilled];
            case Linjestatus.Uferdig:
                return [null, Notes];
        }
    }, [props.status]);

    return <span className={classNames(styles.icon, className)}>{Ikon && <Ikon />}</span>;
};

const Linjevisning = (props: { aktivId: string; linje: Linje }) => {
    const innmat = (
        <div className={styles.linje}>
            <Statusikon status={props.linje.status} />
            {props.linje.id === props.aktivId ? (
                <Label size="small">{props.linje.label}</Label>
            ) : (
                <BodyShort size="small">{props.linje.label}</BodyShort>
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
                        <Label spacing>{e.tittel}</Label>
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
