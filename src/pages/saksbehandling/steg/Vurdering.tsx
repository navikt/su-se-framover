import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Systemtittel } from 'nav-frontend-typografi';
import React from 'react';

import { useI18n } from '~lib/hooks';

import sharedI18n from './sharedI18n-nb';
import styles from './vurdering.module.less';

export const Vurdering = (props: {
    tittel: string;
    children: {
        left: JSX.Element;
        right: JSX.Element;
    };
}) => (
    <div className={styles.contentContainer}>
        <div className={styles.left}>
            <Systemtittel tag="h1" className={styles.tittel}>
                {props.tittel}
            </Systemtittel>
            {props.children.left}
        </div>
        <div className={styles.right}>{props.children.right}</div>
    </div>
);

export const Vurderingknapper = (props: {
    onTilbakeClick(): void;
    onNesteClick?(): void;
    onLagreOgFortsettSenereClick(): void;
}) => {
    const intl = useI18n({ messages: { ...sharedI18n } });

    return (
        <div className={styles.buttonContainer}>
            <div className={styles.navigationButtonContainer}>
                <Knapp onClick={props.onTilbakeClick} htmlType="button">
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Knapp>
                <Hovedknapp onClick={props.onNesteClick} htmlType={props.onNesteClick ? 'button' : 'submit'}>
                    {intl.formatMessage({ id: 'knapp.neste' })}
                </Hovedknapp>
            </div>
            <Knapp onClick={props.onLagreOgFortsettSenereClick} htmlType="button">
                {intl.formatMessage({ id: 'knapp.lagreOgfortsettSenere' })}
            </Knapp>
        </div>
    );
};
