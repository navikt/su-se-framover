declare module 'nav-frontend-ikoner-assets' {
    interface IkonProps {
        height?: number | string;
        width?: number | string;
        kind:
            | 'advarsel-sirkel-fyll'
            | 'feil-sirkel-fyll'
            | 'hamburger'
            | 'help-circle'
            | 'help-circle_hover'
            | 'info-sirkel-fyll'
            | 'ok-sirkel-fyll'
            | 'søk'
            | 'spinner-negativ'
            | 'spinner-transparent'
            | 'systemer'
            | 'x';
        onClick?: () => void;
        preview?: boolean;
        size?: number | string;
        style?: React.CSSProperties;
        wrapperStyle?: React.CSSProperties;
    }

    declare const Ikon: React.ReactType<IkonProps>;
    export default Ikon;
}
