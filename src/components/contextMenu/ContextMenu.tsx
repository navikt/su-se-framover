import { useEffect, useState } from 'react';

import styles from './ContextMenu.module.less';
import { ContextMenuVariables } from './ContextMenuUtils';

/**
 *
 * contextMenuVariables - onMenuClick er en spesiell callback dersom du vil at menyen skal gjøre et kall med data den
 *  er avhengig av fra et dypere nivå i komponenttreet. Se for eksempel i Table.DataCell i BehandlingssammendragTabell sin onContextMenu
 *  callback. På denne måten vil man kun ha 1 contextMenu åpen på et tidspunkt
 */
const ContextMenu = () => {
    const [contextMenuVariables, setContextMenuVariables] = useState<ContextMenuVariables>({
        pos: { x: 0, y: 0 },
        toggled: false,
        onMenuClick: undefined,
    });

    const resetContextMenuVariables = () =>
        setContextMenuVariables({ pos: { x: 0, y: 0 }, toggled: false, onMenuClick: undefined });

    useEffect(() => {
        const eventHandler = () => resetContextMenuVariables();

        document.addEventListener('click', eventHandler);
        document.addEventListener('scroll', eventHandler);

        return () => {
            document.removeEventListener('click', eventHandler);
            document.removeEventListener('scroll', eventHandler);
        };
    });

    const Menu = (props: { children: React.ReactNode }) => (
        <menu
            className={styles.menu}
            style={{
                top: `${contextMenuVariables.pos.y}px`,
                left: `${contextMenuVariables.pos.x}px`,
            }}
        >
            <li className={styles.menuListItem}>{props.children}</li>
        </menu>
    );

    return { Menu, contextMenuVariables, setContextMenuVariables, resetContextMenuVariables };
};

export default ContextMenu;
