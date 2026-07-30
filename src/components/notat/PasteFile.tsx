import { BodyShort, Box, Button, TextField } from '@navikt/ds-react';
import type { ClipboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Nullable } from '~src/lib/types.ts';

type Props = {
    disabled?: boolean;
    onSelectFile: (file: File) => void;
};

const readClipboardFile = async () => {
    if (!navigator.clipboard?.read) {
        return null;
    }

    const clipboardItems = await navigator.clipboard.read();

    for (const item of clipboardItems) {
        const clipboardType = item.types.find((type) => type.startsWith('image/') || type.startsWith('application/'));
        if (!clipboardType) {
            continue;
        }

        const blob = await item.getType(clipboardType);
        const extension = clipboardType.split('/')[1] ?? 'bin';

        return new File([blob], `utklippstavle.${extension}`, { type: blob.type || clipboardType });
    }

    return null;
};

const getFirstPastedFile = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const fromFiles = event.clipboardData.files[0];
    if (fromFiles) {
        return fromFiles;
    }

    const pastedItem = Array.from(event.clipboardData.items).find((item) => item.kind === 'file');
    return pastedItem?.getAsFile() ?? null;
};

export default function PasteFile(props: Props) {
    const pasteTargetRef = useRef<HTMLTextAreaElement | null>(null);
    const [venterPåPaste, setVenterPåPaste] = useState(false);
    const [navnPåUtklipp, setNavnPåUtklipp] = useState('');
    const [feilNavnPåUtklipp, setFeilNavnPåUtklipp] = useState<Nullable<string>>(null);

    const handleButtonClick = useCallback(async () => {
        if (props.disabled) {
            return;
        }

        try {
            const file = await readClipboardFile();
            if (file) {
                if (navnPåUtklipp.length < 1) {
                    setFeilNavnPåUtklipp('Mangler navn på utklipp');
                    return;
                }
                setFeilNavnPåUtklipp(null);
                setVenterPåPaste(false);
                props.onSelectFile(navngiUtklipp(file, navnPåUtklipp));
                return;
            }
        } catch {
            // Fall gjennom til paste-catcher når nettleseren krever manuell innliming.
        }

        setVenterPåPaste(true);
        window.requestAnimationFrame(() => {
            pasteTargetRef.current?.focus();
        });
    }, [props.disabled, props.onSelectFile, navnPåUtklipp, feilNavnPåUtklipp]);

    useEffect(() => {
        if (!venterPåPaste || props.disabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v';
            if (!isPasteShortcut) {
                return;
            }

            event.preventDefault();
            pasteTargetRef.current?.focus();
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [props.disabled, venterPåPaste]);

    const handlePaste = useCallback(
        (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
            if (props.disabled) {
                return;
            }

            const file = getFirstPastedFile(event);
            if (!file) {
                return;
            }

            if (navnPåUtklipp.length < 1) {
                setFeilNavnPåUtklipp('Mangler navn på utklipp');
                return;
            }
            setFeilNavnPåUtklipp(null);

            event.preventDefault();
            setVenterPåPaste(false);
            props.onSelectFile(navngiUtklipp(file, navnPåUtklipp));
        },
        [props.disabled, props.onSelectFile, navnPåUtklipp, feilNavnPåUtklipp],
    );

    const navngiUtklipp = (file: File, nyttNavn: string) => {
        const extension = file.type.split('/')[1] ?? '';
        return new File([file], `${nyttNavn}.${extension}`, {
            type: file.type,
            lastModified: file.lastModified,
        });
    };

    return (
        <Box
            background="surface-subtle"
            borderColor="border-subtle"
            borderRadius="medium"
            borderWidth="1"
            padding="4"
            style={{ position: 'relative' }}
        >
            <BodyShort as="p" spacing>
                Lim inn vedlegg fra utklippstavlen. Knappen prøver direkte først, og hvis nettleseren trenger det, åpner
                vi en paste-flyt etterpå.
            </BodyShort>
            <TextField
                label={'Navn på utklipp'}
                error={feilNavnPåUtklipp}
                onChange={(e) => setNavnPåUtklipp(e.target.value.trim())}
            />
            <Button
                type="button"
                variant="secondary"
                style={{ marginTop: '0.75rem' }}
                disabled={props.disabled}
                onClick={handleButtonClick}
            >
                Lim inn fra utklippstavle
            </Button>
            <BodyShort as="p" style={{ marginTop: '0.75rem' }}>
                Fungerer best for skjermklipp og bilder som allerede ligger kopiert.
            </BodyShort>
            {venterPåPaste && (
                <textarea
                    ref={pasteTargetRef}
                    aria-label="Lim inn vedlegg fra utklippstavlen"
                    onPaste={handlePaste}
                    tabIndex={0}
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        width: 1,
                        height: 1,
                        padding: 0,
                        border: 0,
                        margin: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </Box>
    );
}
