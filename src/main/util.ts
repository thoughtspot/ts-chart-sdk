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
