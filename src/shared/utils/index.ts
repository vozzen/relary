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

/**
 * Normalize a timeseries date string into a UTC timestamp (ms).
 * - DD.MM.YYYY -> day, month, year
 * - MM.YYYY / MM-YYYY -> first day of month
 */
export function normalizeTimeseriesDate(raw: string): number {
	if (!isValidTimeseriesDate(raw)) return Number.NaN
	let day = 1
	let month: number
	let year: number
	if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
		const [d, m, y] = raw.split('.')
		day = Number(d)
		month = Number(m)
		year = Number(y)
	} else if (/^\d{2}\.\d{4}$/.test(raw)) {
		const [m, y] = raw.split('.')
		month = Number(m)
		year = Number(y)
	} else {
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
