import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';

import Oppsummeringspanel, {
    Oppsummeringsfarge,
    Oppsummeringsikon,
} from '~components/revurdering/oppsummering/oppsummeringspanel/Oppsummeringspanel';

import styles from './stansoppsummeringsblokk.module.less';

interface Props {
    tittel: string;
    oppsummeringsinput: Array<{ label: string; verdi: string }>;
}
const StansOppsummeringsblokk = (props: Props) => {
    return (
        <Oppsummeringspanel ikon={Oppsummeringsikon.Liste} farge={Oppsummeringsfarge.Lilla} tittel={props.tittel}>
            <ul className={styles.container}>
                {props.oppsummeringsinput.map((input, index) => (
                    <li key={index}>
                        <Label>{input.label}</Label>
                        <BodyShort>{input.verdi}</BodyShort>
                    </li>
                ))}
            </ul>
        </Oppsummeringspanel>
    );
};
export default StansOppsummeringsblokk;
