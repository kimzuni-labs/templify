export const generateUUID = () => {
	// if local dev + http://ip -> crypto.randomUUID is undefined
	if (crypto.randomUUID as typeof crypto.randomUUID | undefined) {
		return crypto.randomUUID();
	}

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		const v = c === "x" ? r : ((r & 0x3) | 0x8);
		return v.toString(16);
	});
};
