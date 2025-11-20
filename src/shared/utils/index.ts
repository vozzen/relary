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
 * Helper to fill gaps between two points with the first point's value.
 */
function fillGapBetweenPoints(
	result: { date: string; value: number }[],
	current: { date: string; value: number },
	nextTs: number
): void {
	const currentTs = normalizeTimeseriesDate(current.date)
	const currentDate = new Date(currentTs)
	
	while (true) {
		currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
		const iterTs = currentDate.getTime()
		if (iterTs >= nextTs) break
		
		const year = currentDate.getUTCFullYear()
		const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
		result.push({ date: `${month}.${year}`, value: current.value })
	}
}

/**
 * Helper to extend series from last point to current month with last value.
 */
function extendToCurrentMonth(
	result: { date: string; value: number }[],
	lastPoint: { date: string; value: number }
): void {
	const lastTs = normalizeTimeseriesDate(lastPoint.date)
	const now = new Date()
	const currentMonthTs = Date.UTC(now.getFullYear(), now.getMonth(), 1)
	
	if (lastTs >= currentMonthTs) return
	
	const extendDate = new Date(lastTs)
	while (true) {
		extendDate.setUTCMonth(extendDate.getUTCMonth() + 1)
		const iterTs = extendDate.getTime()
		if (iterTs > currentMonthTs) break
		
		const year = extendDate.getUTCFullYear()
		const month = String(extendDate.getUTCMonth() + 1).padStart(2, '0')
		result.push({ date: `${month}.${year}`, value: lastPoint.value })
	}
}

/**
 * Interpolate timeseries to have one entry per month between earliest and latest,
 * and extend from latest to current month.
 * Fills gaps with the value from the most recent previous point.
 * Example: (01.2024, 100), (04.2024, 123) becomes:
 *   (01.2024, 100), (02.2024, 100), (03.2024, 100), (04.2024, 123), (05.2024, 123), ...
 */
export function interpolateMonthlyTimeseries(
	points: { date: string; value: number }[]
): { date: string; value: number }[] {
	if (points.length === 0) return []
	
	const sorted = [...points].sort((a, b) => {
		return normalizeTimeseriesDate(a.date) - normalizeTimeseriesDate(b.date)
	})
	
	const result: { date: string; value: number }[] = []
	
	for (let i = 0; i < sorted.length; i++) {
		const current = sorted[i]
		result.push(current)
		
		if (i < sorted.length - 1) {
			const next = sorted[i + 1]
			const nextTs = normalizeTimeseriesDate(next.date)
			fillGapBetweenPoints(result, current, nextTs)
		}
	}
	
	extendToCurrentMonth(result, sorted.at(-1)!)
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
 * Generate derived series for TP.DK.* codes (F0606, F0609, F0610).
 * For each TP.DK.* series, creates a "Gelir(<name>)" series.
 * If user data exists, values = userValue / tpDkValue for matching months.
 * If no user data, shows the TP.DK.* series itself as "Gelir(<name>)" (F0609).
 */
export function generateDerivedSeries(
	userSeries: { date: string; value: number }[],
	remoteSeries: Record<string, { date: string; value: number }[]>
): Record<string, { date: string; value: number }[]> {
	const derived: Record<string, { date: string; value: number }[]> = {}
	
	for (const [code, series] of Object.entries(remoteSeries)) {
		if (!code.startsWith('TP.DK.')) continue
		
		const friendlyName = getSeriesFriendlyName(code)
		const derivedKey = `Gelir(${friendlyName})`
		
		if (userSeries.length === 0) {
			// No user data: show the exchange rate series itself (F0609)
			derived[derivedKey] = series
		} else {
			// User data exists: calculate ratio series (F0606)
			const userMap = createTimeseriesMap(userSeries)
			const derivedPoints = calculateDerivedPoints(userMap, series)
			if (derivedPoints.length > 0) {
				derived[derivedKey] = derivedPoints
			}
		}
	}
	
	return derived
}

/**
 * Generate inflation series from TP.FG.J0 (F0612).
 * Normalizes inflation to 100 at the earliest user data date.
 * If no user data, returns the raw TP.FG.J0 series unchanged.
 */
export function generateInflationSeries(
	userSeries: { date: string; value: number }[],
	remoteSeries: Record<string, { date: string; value: number }[]>
): Record<string, { date: string; value: number }[]> | null {
	const tpFgJ0 = remoteSeries['TP.FG.J0']
	if (!tpFgJ0 || tpFgJ0.length === 0) return null
	
	// If no user data, return raw series
	if (userSeries.length === 0) {
		return { 'Enflasyon': tpFgJ0 }
	}
	
	// Find earliest user data date
	const timestamps = userSeries
		.map(p => normalizeTimeseriesDate(p.date))
		.filter(ts => Number.isFinite(ts))
	
	if (timestamps.length === 0) return null
	
	const earliestUserDate = Math.min(...timestamps)
	
	// Find TP.FG.J0 value at earliest user date
	const tpFgJ0Map = createTimeseriesMap(tpFgJ0)
	const baseValue = tpFgJ0Map.get(earliestUserDate)?.value
	
	if (!baseValue || baseValue === 0) return null
	
	// Normalize inflation series: (value / baseValue) * 100
	const inflationSeries = tpFgJ0.map(point => ({
		date: point.date,
		value: (point.value / baseValue) * 100
	}))
	
	return { 'Enflasyon': inflationSeries }
}

/**
 * Generate "Alım gücü" (Purchasing Power) series from user data and inflation series (F0613).
 * Steps:
 * 1. Normalize user data to 100 at first user data value (divide by first value * 100)
 * 2. Divide normalized user data by Enflasyon series values
 * 3. Multiply by 100
 * 
 * Returns null if:
 * - User data is empty
 * - Inflation series is empty
 * - First user data value is zero
 * - No matching dates between user data and inflation
 * 
 * @param userSeries User-entered income data
 * @param inflationSeries Normalized inflation series (from generateInflationSeries)
 * @returns Record with single key "Alım gücü" containing calculated series, or null
 */
export function generatePurchasingPowerSeries(
	userSeries: { date: string; value: number }[],
	inflationSeries: { date: string; value: number }[] | null
): Record<string, { date: string; value: number }[]> | null {
	// Require user data
	if (userSeries.length === 0) {
		return null
	}
	
	// Require inflation data
	if (!inflationSeries || inflationSeries.length === 0) {
		return null
	}
	
	// Get first user data value as base
	const firstUserValue = userSeries[0].value
	if (firstUserValue === 0) {
		return null
	}
	
	// Create map of inflation values by date for easy lookup
	const inflationMap = new Map<string, number>()
	for (const point of inflationSeries) {
		inflationMap.set(point.date, point.value)
	}
	
	// Calculate purchasing power for each user data point that has matching inflation
	const purchasingPowerSeries: { date: string; value: number }[] = []
	
	for (const userPoint of userSeries) {
		const inflationValue = inflationMap.get(userPoint.date)
		
		// Skip if no matching inflation data or inflation is zero
		if (inflationValue === undefined || inflationValue === 0) {
			continue
		}
		
		// Step 1: Normalize user data (userValue / firstUserValue * 100)
		const normalizedUserValue = (userPoint.value / firstUserValue) * 100
		
		// Step 2-3: Divide by inflation and multiply by 100
		const purchasingPower = (normalizedUserValue / inflationValue) * 100
		
		purchasingPowerSeries.push({
			date: userPoint.date,
			value: purchasingPower
		})
	}
	
	if (purchasingPowerSeries.length === 0) {
		return null
	}
	
	return { 'Alım gücü': purchasingPowerSeries }
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
