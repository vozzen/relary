export function noop() {}

/**
 * Validate allowed timeseries date formats.
 * Formats: DD.MM.YYYY | MM.YYYY | MM-YYYY
 */
export function isValidTimeseriesDate(raw: string): boolean {
	const ddmmyyyy = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/
	const mmyyyyDot = /^(0[1-9]|1[0-2])\.\d{4}$/
	const mmyyyyDash = /^(0[1-9]|1[0-2])-\d{4}$/
	return ddmmyyyy.test(raw) || mmyyyyDot.test(raw) || mmyyyyDash.test(raw)
}

/**
 * Parse multiline text into timeseries points.
 * Each non-empty line: "<date> <value>"
 * Returns { points, valid } where valid=false if any line invalid.
 */
export function parseTimeseriesInput(input: string): {
	points: { date: string; value: number }[]
	valid: boolean
} {
	const lines = input.split(/\r?\n/)
	const points: { date: string; value: number }[] = []
	let allValid = true
	for (const line of lines) {
		if (!line.trim()) continue
		const parts = line.trim().split(/\s+/)
		if (parts.length < 2) {
			allValid = false
			continue
		}
		const [dateRaw, valueRaw] = parts
		if (!isValidTimeseriesDate(dateRaw)) {
			allValid = false
			continue
		}
		const num = Number(valueRaw)
		if (!Number.isFinite(num)) {
			allValid = false
			continue
		}
		points.push({ date: dateRaw, value: num })
	}
	return { points, valid: allValid && points.length > 0 }
}
