import { BodyShort, Label } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import styles from './faktablokk.module.less';

export const FaktaSpacing: Fakta = { faktatype: 'spacing' };
export function customFakta(element: JSX.Element): CustomFakta {
    return { faktatype: 'custom', element: element };
}

interface FaktaSpacing {
    faktatype: 'spacing';
}
interface CustomFakta {
    faktatype: 'custom';
    element: JSX.Element;
}

export type Fakta =
    | {
          tittel: string;
          verdi: string | JSX.Element;
      }
    | FaktaSpacing
    | CustomFakta;

function isFaktaspacing(f: Fakta): f is FaktaSpacing {
    return 'faktatype' in f && f.faktatype === 'spacing';
}
function isCustomfakta(f: Fakta): f is CustomFakta {
    return 'faktatype' in f && f.faktatype === 'custom';
}

const Faktablokk = (props: { tittel: string; fakta: Fakta[] }) => (
    <div>
        <Label className={styles.overskrift} spacing>
            {props.tittel}
        </Label>
        <Faktaliste fakta={props.fakta} />
    </div>
);

const Faktaliste = (props: { fakta: Fakta[] }) => (
    <ul className={classNames(styles.fakta)}>
        {props.fakta.map((f, index) =>
            isFaktaspacing(f) ? (
                <li key={index} className={styles.faktaSpacing}></li>
            ) : isCustomfakta(f) ? (
                <li key={index}>{f.element}</li>
            ) : (
                <li key={index}>
                    <BodyShort size="small" className={styles.tittel}>
                        {f.tittel}
                    </BodyShort>
                    <Label as={typeof f.verdi === 'string' ? 'p' : 'div'} size="small" className={styles.verdi}>
                        {f.verdi}
                    </Label>
                </li>
            )
        )}
    </ul>
);

export default Faktablokk;
