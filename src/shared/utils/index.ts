export function noop() {}

/**
 * Validate allowed timeseries date formats.
 * Formats: DD.MM.YYYY | D.M.YYYY | MM.YYYY | M.YYYY | MM-YYYY | M-YYYY | D-M-YYYY
 */
export function isValidTimeseriesDate(raw: string): boolean {
	// DD.MM.YYYY or D.M.YYYY (day.month.year with 1-2 digits for day and month)
	const ddmmyyyyDot = /^([1-9]|0[1-9]|[12]\d|3[01])\.([1-9]|0[1-9]|1[0-2])\.\d{4}$/
	// MM.YYYY or M.YYYY (month.year with 1-2 digits for month)
	const mmyyyyDot = /^([1-9]|0[1-9]|1[0-2])\.\d{4}$/
	// MM-YYYY or M-YYYY (month-year with 1-2 digits for month)
	const mmyyyyDash = /^([1-9]|0[1-9]|1[0-2])-\d{4}$/
	// D-M-YYYY (day-month-year with 1-2 digits for day and month)
	const ddmmyyyyDash = /^([1-9]|0[1-9]|[12]\d|3[01])-([1-9]|0[1-9]|1[0-2])-\d{4}$/
	return ddmmyyyyDot.test(raw) || mmyyyyDot.test(raw) || mmyyyyDash.test(raw) || ddmmyyyyDash.test(raw)
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

/**
 * Normalize a timeseries date string into a UTC timestamp (ms).
 * - DD.MM.YYYY | D.M.YYYY -> day, month, year
 * - MM.YYYY | M.YYYY -> first day of month
 * - MM-YYYY | M-YYYY -> first day of month
 * - D-M-YYYY -> day, month, year
 */
export function normalizeTimeseriesDate(raw: string): number {
	if (!isValidTimeseriesDate(raw)) return Number.NaN
	let day = 1
	let month: number
	let year: number
	
	// Check if it contains day.month.year pattern (D.M.YYYY or DD.MM.YYYY)
	if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(raw)) {
		const [d, m, y] = raw.split('.')
		day = Number(d)
		month = Number(m)
		year = Number(y)
	}
	// Check if it contains day-month-year pattern (D-M-YYYY)
	else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(raw)) {
		const [d, m, y] = raw.split('-')
		day = Number(d)
		month = Number(m)
		year = Number(y)
	}
	// Check if it contains month.year pattern (M.YYYY or MM.YYYY)
	else if (/^\d{1,2}\.\d{4}$/.test(raw)) {
		const [m, y] = raw.split('.')
		month = Number(m)
		year = Number(y)
	}
	// Must be month-year pattern (M-YYYY or MM-YYYY)
	else {
		const [m, y] = raw.split('-')
		month = Number(m)
		year = Number(y)
	}
	return Date.UTC(year, month - 1, day)
}

/**
 * Interpolate timeseries to have one entry per month between earliest and latest.
 * Fills gaps with the value from the most recent previous point.
 * Example: (01.2024, 100), (04.2024, 123) becomes:
 *   (01.2024, 100), (02.2024, 100), (03.2024, 100), (04.2024, 123)
 */
export function interpolateMonthlyTimeseries(
	points: { date: string; value: number }[]
): { date: string; value: number }[] {
	if (points.length === 0) return []
	
	// Sort by timestamp
	const sorted = [...points].sort((a, b) => {
		return normalizeTimeseriesDate(a.date) - normalizeTimeseriesDate(b.date)
	})
	
	const result: { date: string; value: number }[] = []
	
	for (let i = 0; i < sorted.length; i++) {
		const current = sorted[i]
		result.push(current)
		
		// If not the last point, fill gaps to next point
		if (i < sorted.length - 1) {
			const next = sorted[i + 1]
			const currentTs = normalizeTimeseriesDate(current.date)
			const nextTs = normalizeTimeseriesDate(next.date)
			
			// Generate all months between current and next
			let iterTs = currentTs
			const currentDate = new Date(currentTs)
			
			while (true) {
				// Move to next month
				currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
				iterTs = currentDate.getTime()
				
				// Stop if we've reached or passed the next point
				if (iterTs >= nextTs) break
				
				// Add interpolated point with current value
				const year = currentDate.getUTCFullYear()
				const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
				result.push({
					date: `${month}.${year}`,
					value: current.value
				})
			}
		}
	}
	
	return result
}

/**
 * Build chart-friendly unified data rows.
 * Each unique date becomes one row with user + remote series values.
 */
/**
 * Create a map of timeseries data indexed by normalized timestamp.
 */
function createTimeseriesMap(series: { date: string; value: number }[]): Map<number, { date: string; value: number }> {
	const map = new Map<number, { date: string; value: number }>()
	for (const point of series) {
		const ts = normalizeTimeseriesDate(point.date)
		if (Number.isFinite(ts)) {
			map.set(ts, point)
		}
	}
	return map
}

/**
 * Calculate derived series points for a single TP.DK.* series.
 */
function calculateDerivedPoints(
	userMap: Map<number, { date: string; value: number }>,
	remoteSeries: { date: string; value: number }[]
): { date: string; value: number }[] {
	const remoteMap = createTimeseriesMap(remoteSeries)
	const derivedPoints: { date: string; value: number }[] = []
	
	for (const [ts, userPoint] of userMap.entries()) {
		const remotePoint = remoteMap.get(ts)
		if (remotePoint && remotePoint.value !== 0) {
			derivedPoints.push({
				date: userPoint.date,
				value: userPoint.value / remotePoint.value
			})
		}
	}
	
	return derivedPoints
}

/**
 * Generate derived series for TP.DK.* codes (F0606).
 * For each TP.DK.* series, creates a "₺/<name>" series with values = userValue / tpDkValue.
 * Only generates data points for months that exist in user data.
 */
export function generateDerivedSeries(
	userSeries: { date: string; value: number }[],
	remoteSeries: Record<string, { date: string; value: number }[]>
): Record<string, { date: string; value: number }[]> {
	if (userSeries.length === 0) {
		return {}
	}
	
	const userMap = createTimeseriesMap(userSeries)
	const derived: Record<string, { date: string; value: number }[]> = {}
	
	for (const [code, series] of Object.entries(remoteSeries)) {
		if (!code.startsWith('TP.DK.')) continue
		
		const derivedPoints = calculateDerivedPoints(userMap, series)
		if (derivedPoints.length > 0) {
			const friendlyName = getSeriesFriendlyName(code)
			derived[`₺/${friendlyName}`] = derivedPoints
		}
	}
	
	return derived
}

/**
 * Extract friendly name from series code (F0605).
 * For codes starting with "TP.DK.", extracts the term after "TP.DK.".
 * Example: "TP.DK.EUR.A.YTL" -> "EUR"
 * For other codes, returns the full code.
 */
export function getSeriesFriendlyName(code: string): string {
	if (code.startsWith('TP.DK.')) {
		const parts = code.split('.')
		if (parts.length >= 3 && parts[2]) {
			return parts[2] // Return the term after TP.DK.
		}
	}
	return code
}

/**
 * Calculate date range for chart display based on user data (F0608).
 * If user has valid data, returns from earliest user data to current month.
 * Otherwise, returns default range from 01.2006 to current month.
 * End date is always set to the first day of the current month.
 */
export function calculateChartDateRange(userSeries: { date: string; value: number }[]): {
	minDate: number
	maxDate: number
} {
	// Always set maxDate to first day of current month (F0608)
	const now = new Date()
	const maxDate = Date.UTC(now.getFullYear(), now.getMonth(), 1)
	
	if (userSeries.length === 0) {
		// Default range: 01.2006 to current month
		const minDate = Date.UTC(2006, 0, 1) // January 1, 2006
		return { minDate, maxDate }
	}

	// Calculate range from user data
	const timestamps = userSeries
		.map(p => normalizeTimeseriesDate(p.date))
		.filter(ts => Number.isFinite(ts))
	
	if (timestamps.length === 0) {
		// Fallback to default if no valid dates
		const minDate = Date.UTC(2006, 0, 1)
		return { minDate, maxDate }
	}

	const minDate = Math.min(...timestamps)
	// maxDate is always current month regardless of user data (F0608)
	return { minDate, maxDate }
}

export function buildTimeseriesChartData(
	user: { date: string; value: number }[],
	remote: Record<string, { date: string; value: number }[]>
): Array<Record<string, number | string>> {
	const map = new Map<number, Record<string, number | string>>()

	const upsert = (label: string, value: number, key: string) => {
		const ts = normalizeTimeseriesDate(label)
		if (!Number.isFinite(ts)) return
		const existing = map.get(ts) || { ts, dateLabel: label }
		existing[key] = value
		map.set(ts, existing)
	}

	for (const p of user) upsert(p.date, p.value, 'user')

	for (const [rKey, series] of Object.entries(remote)) {
		for (const p of series) upsert(p.date, p.value, rKey)
	}

	return Array.from(map.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([, row]) => row)
}
