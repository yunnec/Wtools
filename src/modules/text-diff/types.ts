/**
 * 文本差异对比模块类型定义
 */

export interface DiffResult {
  added?: boolean
  removed?: boolean
  value: string
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified'
  content: string
  lineNumber?: number
}

export interface DiffStats {
  addedLines: number
  removedLines: number
  modifiedLines: number
  unchangedLines: number
  addedWords: number
  removedWords: number
}

export type CompareMode = 'side-by-side' | 'inline'
export type CompareGranularity = 'line' | 'word'
