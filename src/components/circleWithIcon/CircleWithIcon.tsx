import classNames from 'classnames';
import * as React from 'react';

import styles from './circleWithIcon.module.less';

interface CircleWithIconProps {
    icon: React.ReactNode;
    variant: 'yellow';
    size?: 'medium' | 'small';
}

const CircleWithIcon = (props: CircleWithIconProps) => (
    <div
        className={classNames(
            styles.container,
            styles[`variant-${props.variant}`],
            styles[`size-${props.size ?? 'medium'}`]
        )}
    >
        {props.icon}
    </div>
);

export default CircleWithIcon;
