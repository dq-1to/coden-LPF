import {
  ArrowLeftRight,
  Braces,
  Clock,
  Code,
  Download,
  FileCode,
  HelpCircle,
  Package,
  Plug,
  Puzzle,
  Send,
  Shield,
  TreePine,
  type LucideIcon,
} from 'lucide-react'

// content/base-nook/topics.ts の icon 名 → コンポーネントの明示マップ。
// `import * as Icons from 'lucide-react'` による動的解決は全アイコン
// （約600KB）をバンドルに取り込み tree-shaking を無効化するため使わない（#295）。
// 新しいトピックでアイコンを追加する場合はここにも追記する
// （漏れは topicIcons.test.ts が検出する）。
const TOPIC_ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Braces,
  Clock,
  Code,
  Download,
  FileCode,
  Package,
  Plug,
  Puzzle,
  Send,
  Shield,
  TreePine,
}

export function getTopicIcon(name: string): LucideIcon {
  return TOPIC_ICONS[name] ?? HelpCircle
}

export function hasTopicIcon(name: string): boolean {
  return name in TOPIC_ICONS
}
