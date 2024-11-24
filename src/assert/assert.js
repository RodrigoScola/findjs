/**
 * @param {any} truthy
 * @param {string} msg
 * @param {...any[]} others = []
 */
export function assert(truthy, msg, ...others) {
	if (!truthy) {
		if (others) {
			msg += others.map((f) => JSON.stringify(f)).join();
		}
		throw new Error(msg);
	}
}

export default assert;
