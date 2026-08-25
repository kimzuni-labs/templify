interface LoadResultSuccess<T> {
	module: T;
	error : null;
}

interface LoadResultError {
	module: null;
	error : Error;
}

type LoadResult<T> =
	| LoadResultSuccess<T>
	| LoadResultError;



const moduleCache = new Map<string, Promise<LoadResult<unknown>>>();

export function loadEsmModule<T>(version: number | string): Promise<LoadResult<T>> {
	const v = version.toString();

	let data = moduleCache.get(v) as Promise<LoadResult<T>> | undefined;
	if (!data) {
		data = import(/* @vite-ignore */ `https://esm.sh/@kimzuni/templify@${v}`)
			.then(mod => ({
				module: mod as T,
				error : null,
			} satisfies LoadResultSuccess<T>))
			.catch((err: unknown) => ({
				module: null,
				error : err instanceof Error ? err : new Error(String(err)),
			}));
		moduleCache.set(v, data);
	}

	return data;
}
