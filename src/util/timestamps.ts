const tolerance = 2 * 60 * 1000; // 2 minutes

function isTimestampAround(toCheck: number, expected: number): boolean {
	return Math.abs(toCheck - expected) <= tolerance;
}

export default {
	isTimestampAround
};