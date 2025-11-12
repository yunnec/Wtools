/**
 * 文本差异对比服务
 * 使用diff库实现文本差异检测和高亮显示
 */

import * as Diff from 'diff'
import type { DiffResult, DiffLine, DiffStats, CompareGranularity } from '../types'

export class DiffService {
  /**
   * 执行文本差异对比
   */
  static compare(
    originalText: string,
    modifiedText: string,
    granularity: CompareGranularity = 'line'
  ): DiffResult[] {
    if (!originalText && !modifiedText) {
      return []
    }

    let diff: DiffResult[] = []

    if (granularity === 'line') {
      // 行级对比
      diff = Diff.diffLines(originalText, modifiedText)
    } else {
      // 词级对比
      diff = Diff.diffWords(originalText, modifiedText)
    }

    return diff
  }

  /**
   * 转换为行数据格式
   */
  static toLineFormat(diff: DiffResult[]): DiffLine[] {
    const lines: DiffLine[] = []
    let lineNumber = 1

    for (const part of diff) {
      const contentLines = part.value.split('\n')

      // 移除最后一个空元素（因为split会包含最后的换行符）
      if (contentLines[contentLines.length - 1] === '') {
        contentLines.pop()
      }

      for (const line of contentLines) {
        if (line.length > 0 || contentLines.length === 1) {
          if (part.added) {
            lines.push({
              type: 'added',
              content: line,
              lineNumber: lineNumber++
            })
          } else if (part.removed) {
            lines.push({
              type: 'removed',
              content: line,
              lineNumber: lineNumber++
            })
          } else {
            lines.push({
              type: 'unchanged',
              content: line,
              lineNumber: lineNumber++
            })
          }
        }
      }
    }

    return lines
  }

  /**
   * 生成并排格式的差异数据
   */
  static generateSideBySide(originalText: string, modifiedText: string) {
    const diff = this.compare(originalText, modifiedText, 'line')
    const originalLines = this.toLineFormat(
      diff.filter(d => !d.added)
    )
    const modifiedLines = this.toLineFormat(
      diff.filter(d => !d.removed)
    )

    // 配对行
    const pairs: Array<{
      original?: DiffLine
      modified?: DiffLine
    }> = []

    let i = 0
    let j = 0

    while (i < originalLines.length || j < modifiedLines.length) {
      const original = i < originalLines.length ? originalLines[i] : undefined
      const modified = j < modifiedLines.length ? modifiedLines[j] : undefined

      if (original && original.type === 'unchanged' && modified && modified.type === 'unchanged') {
        pairs.push({ original, modified })
        i++
        j++
      } else if (original && original.type === 'removed') {
        pairs.push({ original, modified: undefined })
        i++
      } else if (modified && modified.type === 'added') {
        pairs.push({ original: undefined, modified })
        j++
      } else {
        // 处理修改（删除+添加的组合）
        if (original && modified) {
          pairs.push({ original, modified })
          i++
          j++
        } else if (original) {
          pairs.push({ original, modified: undefined })
          i++
        } else if (modified) {
          pairs.push({ original: undefined, modified })
          j++
        }
      }
    }

    return pairs
  }

  /**
   * 生成行内格式的差异数据
   */
  static generateInline(originalText: string, modifiedText: string): DiffLine[] {
    return this.toLineFormat(
      this.compare(originalText, modifiedText, 'word')
    )
  }

  /**
   * 计算差异统计信息
   */
  static calculateStats(originalText: string, modifiedText: string): DiffStats {
    const diff = this.compare(originalText, modifiedText, 'line')

    let addedLines = 0
    let removedLines = 0
    let unchangedLines = 0

    for (const part of diff) {
      const lineCount = part.value.split('\n').length - 1

      if (part.added) {
        addedLines += lineCount
      } else if (part.removed) {
        removedLines += lineCount
      } else {
        unchangedLines += lineCount
      }
    }

    const wordDiff = this.compare(originalText, modifiedText, 'word')
    let addedWords = 0
    let removedWords = 0

    for (const part of wordDiff) {
      if (part.added) {
        addedWords += part.value.trim().split(/\s+/).filter(w => w.length > 0).length
      } else if (part.removed) {
        removedWords += part.value.trim().split(/\s+/).filter(w => w.length > 0).length
      }
    }

    // 简单计算修改行数（删除+添加的组合）
    const modifiedLines = Math.min(addedLines, removedLines)
    addedLines -= modifiedLines
    removedLines -= modifiedLines

    return {
      addedLines,
      removedLines,
      modifiedLines,
      unchangedLines,
      addedWords,
      removedWords
    }
  }

  /**
   * 获取高亮HTML
   */
  static getHighlightedHtml(text: string, isAdded: boolean, isRemoved: boolean): string {
    if (isAdded) {
      return `<span class="diff-added">${this.escapeHtml(text)}</span>`
    } else if (isRemoved) {
      return `<span class="diff-removed">${this.escapeHtml(text)}</span>`
    }
    return this.escapeHtml(text)
  }

  /**
   * HTML转义
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

export default DiffService
