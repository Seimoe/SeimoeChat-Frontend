export async function retry<T>(
    operation: () => Promise<T>,
    retryCount = 3,
    delayFunc?: (attempt: number) => number
): Promise<T> {
    let attempts = 0;
    while (attempts < retryCount) {
        try {
            return await operation();
        } catch (error) {
            attempts++;
            if (attempts >= retryCount) {
                throw error;
            }
            const waitTime = delayFunc ? delayFunc(attempts) : 1000 * attempts;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    throw new Error('Retry: Unreachable');
} 