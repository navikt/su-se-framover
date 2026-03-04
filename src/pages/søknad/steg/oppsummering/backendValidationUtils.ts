import { ApiError } from '~src/api/apiClient';
import { Sakstype } from '~src/types/Sak';

const UGYLDIG_SØKNADSINNHOLD_INPUT_CODE = 'ugyldig_soknadsinnhold_input';
const FELT_FRA_MESSAGE_REGEX = /felt\s+([^:]+):/i;

interface BackendValideringsfeil {
    code: string;
    message: string;
    felt?: string;
}

interface RecordOfUnknown {
    [key: string]: unknown;
}

export interface FrontendValideringsfeil {
    code: string;
    message: string;
    field?: string;
}

export function hentSøknadsinnholdValideringsfeil(
    error: ApiError,
    sakstype: Sakstype,
): FrontendValideringsfeil[] | null {
    const body = toRecord(error.body);
    if (!body) return null;

    const code = toNullableString(body.code);
    if (code !== UGYLDIG_SØKNADSINNHOLD_INPUT_CODE) return null;

    const errors = utledValideringsfeil(body.errors, code);
    if (errors.length === 0) {
        const fallbackMessage = toNullableString(body.message) ?? 'Ugyldig input';
        return [{ code, message: fallbackMessage }];
    }

    return errors.map((it) => ({
        code: it.code,
        message: it.message,
        field: it.felt ? mapBackendFieldPathToFrontendFieldPath(it.felt, sakstype) : undefined,
    }));
}

export function mapBackendFieldPathToFrontendFieldPath(backendFieldPath: string, sakstype: Sakstype): string {
    let path = normalizeFieldPath(backendFieldPath);

    path = replacePrefix(path, 'boforhold.', 'boOgOpphold.');
    path = replacePrefix(path, 'forNav.', 'forVeileder.');
    path = replacePrefix(path, 'ektefelle.inntektOgPensjon.', 'ektefelle.inntekt.');
    path = replacePrefix(path, 'inntektOgPensjon.', 'inntekt.');
    path = replacePrefix(path, 'oppholdstillatelseAlder.', 'oppholdstillatelse.');
    path = replacePrefix(path, 'flyktningsstatus.', 'flyktningstatus.');

    if (sakstype === Sakstype.Uføre) {
        path = replacePrefix(path, 'oppholdstillatelse.', 'flyktningstatus.');
    }

    path = replaceExact(path, 'flyktningstatus.registrertFlyktning', 'flyktningstatus.erFlyktning');
    path = replaceExact(path, 'uførevedtak.harUførevedtak', 'harUførevedtak');
    path = replaceExact(path, 'harSøktAlderspensjon.harSøktAlderspensjon', 'harSøktAlderspensjon');
    path = replacePrefix(path, 'boOgOpphold.innlagtPåInstitusjon.', 'boOgOpphold.');
    path = path.replace(/(^|\.)pensjon(?=\.|$)/g, '$1pensjonsInntekt');

    return path;
}

function utledValideringsfeil(rawErrors: unknown, fallbackCode: string): BackendValideringsfeil[] {
    if (!Array.isArray(rawErrors)) return [];

    const seen = new Set<string>();

    return rawErrors.flatMap((raw) => {
        const err = toRecord(raw);
        if (!err) return [];

        const code = toNullableString(err.code) ?? fallbackCode;
        const messageFromErr = toNullableString(err.message);
        const felt = toNullableString(err.felt) ?? toNullableString(err.field) ?? utledFeltFraMessage(messageFromErr);
        const begrunnelse = toNullableString(err.begrunnelse);
        const message =
            messageFromErr ??
            (begrunnelse
                ? felt
                    ? `Ugyldig input i felt ${felt}: ${begrunnelse}`
                    : `Ugyldig input: ${begrunnelse}`
                : null);

        if (!message) return [];

        const dedupeKey = `${code}|${felt ?? ''}|${message}`;
        if (seen.has(dedupeKey)) return [];

        seen.add(dedupeKey);
        return [{ code, message, felt }];
    });
}

function utledFeltFraMessage(message: string | null): string | undefined {
    if (!message) return undefined;

    const match = message.match(FELT_FRA_MESSAGE_REGEX);
    return match?.[1]?.trim();
}

function toRecord(value: unknown): RecordOfUnknown | null {
    if (typeof value !== 'object' || value === null) return null;
    return value as RecordOfUnknown;
}

function toNullableString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

function normalizeFieldPath(path: string): string {
    return path
        .replace(/\[(\d+)]/g, '.$1')
        .replace(/\.\./g, '.')
        .replace(/^\.+|\.+$/g, '');
}

function replacePrefix(value: string, prefix: string, replacement: string): string {
    if (value.startsWith(prefix)) {
        return `${replacement}${value.slice(prefix.length)}`;
    }

    return value;
}

function replaceExact(value: string, expected: string, replacement: string): string {
    return value === expected ? replacement : value;
}
