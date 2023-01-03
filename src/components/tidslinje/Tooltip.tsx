import classNames from 'classnames';
import React, { ReactNode } from 'react';

import styles from './Tooltip.module.less';

interface TooltipProps {
    children: ReactNode | ReactNode[];
    className?: string;
}

export const Tooltip = ({ children, className }: TooltipProps) => (
    <div className={classNames(className, styles.tooltip)}>{children}</div>
);
