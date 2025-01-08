export function timeout(promise: Promise<any>, ms: number, message?: string) {
    return Promise.race([
        promise,
        new Promise((resolve, reject) => {
            setTimeout(
                () => reject(new Error(message || 'Operation timed out.')),
                ms,
            );
        }),
    ]);
}

export function handleMissingValue(
    paramKey: string,
    paramValue?: string | null,
): string {
    if (paramKey === 'debug') {
        return paramValue ?? 'false';
    }

    return paramValue ?? '';
}

export function getQueryParam(url: string, paramName: string): string {
    const urlObj = new URL(url);
    const paramValue = handleMissingValue(
        paramName,
        urlObj.searchParams.get(paramName),
    );
    return paramValue;
}
