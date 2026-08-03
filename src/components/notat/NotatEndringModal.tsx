import { MinusIcon, PlusIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Heading, HStack, VStack } from '@navikt/ds-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '~src/api/apiClient';
import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import TextareaWithAutosaveUtenController from '~src/components/inputs/textareaWithAutosave/TextareaWithAutosaveUtenController.tsx';
import { ApiResult } from '~src/lib/hooks.ts';
import styles from './notatEndringPanel.module.less';
import { TekstModalType } from './notatPanelTypes';

type Props = {
    open: boolean;
    editorType: TekstModalType;
    kanRedigere: boolean;
    notatTekst: string;
    lagrer: boolean;
    successMessage?: string | null;
    actionError?: ApiError | null;
    onClose: () => void;
    onNotatTekstChange: (value: string) => void;
    onSave: () => void;
    status: ApiResult<void>;
};

type Position = { x: number; y: number };

const PANEL_BREDDE = 500;

const initialPosisjon = (): Position => {
    if (typeof window === 'undefined') {
        return { x: 0, y: 0 };
    }
    const bredde = Math.min(PANEL_BREDDE, window.innerWidth - 32);
    return {
        x: Math.max(16, (window.innerWidth - bredde) / 2),
        y: 80,
    };
};

const clampPosisjon = (position: Position): Position => {
    if (typeof window === 'undefined') {
        return position;
    }
    const maxX = Math.max(0, window.innerWidth - 80);
    const maxY = Math.max(0, window.innerHeight - 60);
    return {
        x: Math.min(Math.max(0, position.x), maxX),
        y: Math.min(Math.max(0, position.y), maxY),
    };
};

const NotatEndringModal = (props: Props) => {
    const viserAttestantnotat = props.editorType === 'attestant';
    const tittel = props.kanRedigere
        ? viserAttestantnotat
            ? 'Rediger attestantnotat'
            : 'Rediger notat'
        : viserAttestantnotat
          ? 'Vis attestantnotat'
          : 'Vis notat';

    const [posisjon, setPosisjon] = useState<Position>(initialPosisjon);
    const [minimert, setMinimert] = useState(false);
    const dragStart = useRef<{ pekerX: number; pekerY: number; panelX: number; panelY: number } | null>(null);

    useEffect(() => {
        if (props.open) {
            setPosisjon(initialPosisjon());
            setMinimert(false);
        }
    }, [props.open]);

    const onPointerMove = useCallback((event: PointerEvent) => {
        if (!dragStart.current) {
            return;
        }
        const deltaX = event.clientX - dragStart.current.pekerX;
        const deltaY = event.clientY - dragStart.current.pekerY;
        setPosisjon(
            clampPosisjon({
                x: dragStart.current.panelX + deltaX,
                y: dragStart.current.panelY + deltaY,
            }),
        );
    }, []);

    const stopDrag = useCallback(() => {
        dragStart.current = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopDrag);
    }, [onPointerMove]);

    useEffect(() => stopDrag, [stopDrag]);

    const onHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }
        dragStart.current = {
            pekerX: event.clientX,
            pekerY: event.clientY,
            panelX: posisjon.x,
            panelY: posisjon.y,
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopDrag);
    };

    if (!props.open) {
        return null;
    }

    return (
        <section
            className={styles.panel}
            style={{ left: posisjon.x, top: posisjon.y }}
            role="dialog"
            aria-label={tittel}
        >
            <div className={styles.header} onPointerDown={onHeaderPointerDown}>
                <Heading level="2" size="small">
                    {tittel}
                </Heading>
                <div className={styles.headerButtons}>
                    <Button
                        type="button"
                        variant="tertiary-neutral"
                        size="small"
                        icon={minimert ? <PlusIcon aria-hidden /> : <MinusIcon aria-hidden />}
                        title={minimert ? 'Utvid' : 'Minimer'}
                        aria-label={minimert ? 'Utvid' : 'Minimer'}
                        onClick={() => setMinimert((v) => !v)}
                    />
                    <Button
                        type="button"
                        variant="tertiary-neutral"
                        size="small"
                        icon={<XMarkIcon aria-hidden />}
                        title="Lukk"
                        aria-label="Lukk"
                        onClick={props.onClose}
                    />
                </div>
            </div>
            <div className={minimert ? `${styles.body} ${styles.bodySkjult}` : styles.body}>
                <VStack gap="4">
                    {props.successMessage && (
                        <Alert variant="success" size="small" contentMaxWidth={false}>
                            <BodyShort>{props.successMessage}</BodyShort>
                        </Alert>
                    )}
                    {props.actionError && <ApiErrorAlert error={props.actionError} size="small" />}
                    <TextareaWithAutosaveUtenController
                        textarea={{
                            label: viserAttestantnotat ? 'Attestantnotat' : 'Saksbehandlernotat',
                            value: props.notatTekst,
                            onChange: (value) => props.onNotatTekstChange(value),
                            readonly: !props.kanRedigere,
                            minRows: 8,
                        }}
                        save={{
                            handleSave: () => props.onSave(),
                            status: props.status,
                        }}
                    />
                    <HStack gap="3">
                        {props.kanRedigere ? (
                            <>
                                <Button type="button" onClick={props.onSave} loading={props.lagrer}>
                                    Lagre
                                </Button>
                                <Button type="button" variant="secondary" onClick={props.onClose}>
                                    Avbryt
                                </Button>
                            </>
                        ) : (
                            <Button type="button" variant="secondary" onClick={props.onClose}>
                                Lukk
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </div>
        </section>
    );
};

export default NotatEndringModal;
