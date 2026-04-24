import {
    CheckmarkCircleFillIcon,
    DocPencilIcon,
    QuestionmarkDiamondFillIcon,
    XMarkOctagonFillIcon,
} from '@navikt/aksel-icons';
import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import { useMemo } from 'react';
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
    const [className, Ikon] = useMemo(() => {
        switch (props.status) {
            case Linjestatus.Ingenting:
                return [null, null];
            case Linjestatus.Uavklart:
                return [styles.iconYellow, QuestionmarkDiamondFillIcon];
            case Linjestatus.IkkeOk:
                return [styles.iconRed, XMarkOctagonFillIcon];
            case Linjestatus.Ok:
                return [styles.iconGreen, CheckmarkCircleFillIcon];

            case Linjestatus.Uferdig:
                return [null, DocPencilIcon];
        }
    }, [props.status]);

    return <span className={classNames(styles.icon, className)}>{Ikon && <Ikon />}</span>;
};

const Linjevisning = (props: { aktivId: string; linje: Linje; onClickId?: (id: string) => void }) => {
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
                <Link
                    to={props.linje.url}
                    onClick={
                        props.onClickId
                            ? (e) => {
                                  e.preventDefault();
                                  props.onClickId!(props.linje.id);
                              }
                            : undefined
                    }
                    className={styles.link}
                >
                    {innmat}
                </Link>
            ) : (
                innmat
            )}
        </li>
    );
};

const Framdriftsindikator = (props: {
    elementer: Array<Linje | Seksjon>;
    aktivId: string;
    overrideFørsteLinjeOnClick?: (id: string) => void;
}) => {
    return (
        <ol className={styles.container}>
            {props.elementer.map((e, seksjonIdx) =>
                erSeksjon(e) ? (
                    <li key={e.id}>
                        <Label spacing>{e.tittel}</Label>
                        <ol>
                            {e.linjer.map((l, linjeIdx) => (
                                <Linjevisning
                                    key={l.id}
                                    aktivId={props.aktivId}
                                    linje={l}
                                    onClickId={
                                        seksjonIdx === 0 && linjeIdx === 0 && props.overrideFørsteLinjeOnClick
                                            ? (id) => props.overrideFørsteLinjeOnClick!(id)
                                            : undefined
                                    }
                                />
                            ))}
                        </ol>
                    </li>
                ) : (
                    <Linjevisning
                        key={e.id}
                        aktivId={props.aktivId}
                        linje={e}
                        onClickId={
                            seksjonIdx === 0 && props.overrideFørsteLinjeOnClick
                                ? (id) => props.overrideFørsteLinjeOnClick!(id)
                                : undefined
                        }
                    />
                ),
            )}
        </ol>
    );
};

export default Framdriftsindikator;
