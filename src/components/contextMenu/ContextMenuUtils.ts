export interface ContextMenuVariables {
    pos: { x: number; y: number };
    toggled: boolean;
    onMenuClick?: () => Promise<void>;
}
