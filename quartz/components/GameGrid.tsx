import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "./types"
import { resolveRelative } from "../util/path"

const ICON_KEYS = new Set([
  "pc",
  "kb",
  "mouse",
  "controller",
  "switch",
  "pad",
])

// Поддерживаем и русские, и английские названия статусов
const STATUS_LABEL: Record<string, string> = {
  "пройдено": "Пройдено",
  "играю": "Играю",
  "брошено": "Брошено",
}

// Цветовые классы для бейджа
const STATUS_CLASS: Record<string, string> = {
  "пройдено": "status-completed",
  "играю": "status-playing",
  "брошено": "status-dropped",
}

function normalizeStatus(raw: unknown): { label: string; cls: string } | null {
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
            return (
              <span
              key={i}
              class={`badge badge-${key}`}
              title={key.replace(/-/g, " ")}
              aria-label={key.replace(/-/g, " ")}
              />
            )
          }
          return (
            <span key={i} class="badge badge-text">
            {t.replace(/-/g, " ")}
            </span>
          )
        })}
        </div>
      )
}

const GameGrid: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "games/index") return null

    const games = allFiles
    .filter(f => f.slug?.startsWith("games/") && f.slug !== "games/index")
    .filter(f => normalizeStatus(f.frontmatter?.status) !== null)
    .sort((a, b) => (Number(b.frontmatter?.rating) || 0) - (Number(a.frontmatter?.rating) || 0))

    if (games.length === 0) return null

      return (
        <div class="game-grid">
        {games.map(g => {
          const fm = g.frontmatter ?? {}
          const rating = Number(fm.rating) || 0
          const status = normalizeStatus(fm.status)

          return (
            <a class="game-card" href={resolveRelative(fileData.slug!, g.slug!)}>
            <div class="game-cover">
            <img src={String(fm.cover ?? "")} alt={String(fm.title ?? "")} loading="lazy" />
            {status && (
              <span class={`status-badge ${status.cls}`}>{status.label}</span>
            )}
            {rating > 0 && (
              <span class="rating">{"★".repeat(Math.round(rating / 2))}</span>
            )}
            </div>
            <div class="game-card-body">
            <h3>{String(fm.title ?? "")}</h3>
            {renderPlatform(fm.platform)}
            </div>
            </a>
          )
        })}
        </div>
      )
}

export default (() => GameGrid) satisfies QuartzComponentConstructor
