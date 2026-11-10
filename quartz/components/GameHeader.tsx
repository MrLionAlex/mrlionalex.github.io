import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ICON_KEYS = new Set(["pc", "kb", "mouse", "controller", "switch", "pad"])

const STATUS_LABEL: Record<string, string> = {
    "пройдено": "Пройдено",
    "играю": "Играю",
    "брошено": "Брошено",
}

const STATUS_CLASS: Record<string, string> = {
    "пройдено": "status-completed",
    "играю": "status-playing",
    "брошено": "status-dropped",
}

function normalizeStatus(raw: unknown) {
    if (typeof raw !== "string") return null
        const key = raw.toLowerCase().trim()
        const label = STATUS_LABEL[key]
        const cls = STATUS_CLASS[key]
        if (!label || !cls) return null
            return { label, cls }
}

function renderPlatform(raw: unknown) {
    if (!raw) return null
        const tokens: string[] = Array.isArray(raw)
        ? raw.map(String)
        : String(raw).trim().split(/\s+/)
        if (tokens.length === 0) return null
            return (
                <div class="game-platform">
                {tokens.map((t, i) => {
                    const key = t.toLowerCase()
                    if (ICON_KEYS.has(key)) {
                        return <span key={i} class={`badge badge-${key}`} title={key} aria-label={key} />
                    }
                    return <span key={i} class="badge badge-text">{t.replace(/-/g, " ")}</span>
                })}
                </div>
            )
}

function formatDate(raw: unknown): string | null {
    if (!raw) return null
        const d = new Date(String(raw))
        if (isNaN(d.getTime())) return String(raw)
            return d.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
}

const GameHeader: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (!slug.startsWith("games/") || slug === "games/index") return null

        const fm = fileData.frontmatter ?? {}
        const title = String(fm.title ?? "")
        const cover = String(fm.cover ?? "")
        const rating = Number(fm.rating) || 0
        const playTime = fm.play_time ? String(fm.play_time) : null
        const lastPlay = formatDate(fm.last_play)
        const status = normalizeStatus(fm.status)

        return (
            <div class="game-summary">
            {cover && (
                <div class="game-summary-cover">
                    <img src={cover} alt={title} loading="lazy" />
                </div>
            )}
                <div class="game-summary-info">
                    {status && (
                        <span class={`status-badge-inline ${status.cls}`}>{status.label}</span>
                    )}
                    <dl class="game-summary-facts">
                        {lastPlay && (<><dt>Последний запуск</dt><dd>{lastPlay}</dd></>)}
                        {playTime && (<><dt>Время</dt><dd>{playTime}</dd></>)}
                        {rating > 0 && (
                            <>
                            <dt>Оценка</dt>
                            <dd>
                            <span class="rating">{"★".repeat(Math.round(rating / 2))}</span>
                            <span class="game-summary-rating-num"> ({rating}/10)</span>
                            </dd>
                            </>
                        )}
                    </dl>
                    {renderPlatform(fm.platform)}
                </div>
            </div>
        )
}

export default (() => GameHeader) satisfies QuartzComponentConstructor
