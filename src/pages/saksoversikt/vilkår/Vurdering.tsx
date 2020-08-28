import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';

import styles from './vurdering.module.less';

export const Vurdering = (props: {
    tittel: string;
    children: {
        left: JSX.Element;
        right: JSX.Element;
    };
}) => (
    <div className={styles.container}>
        <Innholdstittel className={styles.tittel}>{props.tittel}</Innholdstittel>
        <div className={styles.contentContainer}>
            <div className={styles.left}>{props.children.left}</div>
            <div className={styles.right}>{props.children.right}</div>
        </div>
    </div>
);

export const Vurderingknapper = (props: {
    onTilbakeClick(): void;
    onNesteClick?(): void;
    onLagreOgFortsettSenereClick(): void;
}) => (
    <div className={styles.buttonContainer}>
        <div className={styles.navigationButtonContainer}>
            <Knapp onClick={props.onTilbakeClick} htmlType="button">
                Tilbake
            </Knapp>
            <Hovedknapp onClick={props.onNesteClick} htmlType={props.onNesteClick ? 'button' : 'submit'}>
                Neste
            </Hovedknapp>
        </div>
        <Knapp onClick={props.onLagreOgFortsettSenereClick} htmlType="button">
            Lagre og fortsett senere
        </Knapp>
    </div>
);
