import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ICON_KEYS = new Set(["pc", "kb", "mouse", "controller", "switch", "pad", "twitch"])

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
        const genre = String(fm.genre ?? "")
        const rating = Number(fm.rating) || 0
        const positive = Number(fm.positive) || 0
        const negative = Number(fm.negative) || 0
        const releaseDate = formatDate(fm.release_date)
        const lastPlay = formatDate(fm.last_played)
        const playTime = fm.playtime ? String(fm.playtime)+" ч." : null
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
                        {releaseDate && (<><dt>Дата выхода</dt><dd>{releaseDate}</dd></>)}
                        {genre && (<><dt>Жанр</dt><dd>{genre}</dd></>)}
                        {(positive > 0 || negative > 0) && (
                            <>
                            <dt>Отзывы Steam</dt>
                            <dd>
                            <span class="review-positive">{positive.toLocaleString("ru-RU")}</span>
                            <span class="review-sep">/</span>
                            <span class="review-negative">{negative.toLocaleString("ru-RU")}</span>
                            </dd>
                            </>
                        )}
                        {lastPlay && (<><dt>Последний запуск</dt><dd>{lastPlay}</dd></>)}
                        {playTime && (<><dt>Общее время</dt><dd>{playTime}</dd></>)}
                        {rating > 0 && (
                            <>
                            <dt>Оценка</dt>
                            <dd>
                            <span class="rating">{"★".repeat(rating)}</span>
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
