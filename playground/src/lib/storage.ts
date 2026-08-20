const KEY_PREFIX = "templify-playground:";

const getKey = (key: string) => `${KEY_PREFIX}${key}`;



export const storage = {
	get: (key: string): string | null => {
		key = getKey(key);
		try {
			return localStorage.getItem(key);
		} catch (error) {
			console.warn(`[localStorage] Failed to get item (${key}):`, error);
			return null;
		}
	},

	set: (key: string, value: string): void => {
		key = getKey(key);
		try {
			localStorage.setItem(key, value);
		} catch (error) {
			console.warn(`[localStorage] Failed to set item (${key}):`, error);
		}
	},

	remove: (key: string): void => {
		key = getKey(key);
		try {
			localStorage.removeItem(key);
		} catch {
			// pass
		}
	},
};



export function getSavedOptions(key: string): Record<string, unknown> | undefined {
	const saved = storage.get(key);
	if (saved) {
		try {
			return JSON.parse(saved) as Record<string, unknown>;
		} catch {
			// pass
		}
	}
}

export function getInitialVal<T>(
	isCustom: boolean,
	savedOptions: Record<string, unknown> | undefined,
	optionKey: string,
	presetVal: T,
	validator?: (val: unknown) => boolean,
	onInvalid?: () => void,
): T {
	if (!isCustom || !savedOptions) {
		return presetVal;
	}
	const saved = savedOptions[optionKey];
	if (saved !== undefined) {
		if (validator && !validator(saved)) {
			onInvalid?.();
			return presetVal;
		}
		return saved as T;
	}
	return presetVal;
}
