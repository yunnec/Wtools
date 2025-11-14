/**
 * TimestampConverter 时间戳转换工具单元测试
 * 测试时间戳与日期的相互转换功能
 */

import { describe, it, expect } from 'vitest'

// 提取转换逻辑为测试函数
function convertTimestampToDate(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? timestamp.trim() : timestamp.toString()
  let numTs = parseInt(ts, 10)

  if (isNaN(numTs)) {
    throw new Error('Invalid timestamp')
  }

  // 自动检测精度
  if (ts.length === 10) {
    numTs = numTs * 1000
  } else if (ts.length === 13) {
    // 保持不变
  } else if (ts.length === 16) {
    // 微秒级，转换为毫秒
    numTs = Math.floor(numTs / 1000)
  } else if (ts.length === 19) {
    // 纳秒级，转换为毫秒
    numTs = Math.floor(numTs / 1000000)
  }

  const date = new Date(numTs)

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function convertDateToTimestamp(dateStr: string): number {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }
  return date.getTime()
}

describe('时间戳转换工具', () => {
  describe('时间戳转日期', () => {
    it('应该正确转换秒级时间戳', () => {
      const timestamp = 1609459200 // 2021-01-01 00:00:00 UTC
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2021-01-01 08:00:00')
    })

    it('应该正确转换毫秒级时间戳', () => {
      const timestamp = 1609459200000 // 2021-01-01 00:00:00 UTC
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2021-01-01 08:00:00')
    })

    it('应该正确转换微秒级时间戳', () => {
      const timestamp = '1609459200000000' // 微秒级
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2021-01-01 08:00:00')
    })

    it('应该正确转换纳秒级时间戳', () => {
      const timestamp = '1609459200000000000' // 纳秒级
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2021-01-01 08:00:00')
    })

    it('应该处理字符串类型时间戳', () => {
      const timestamp = '1609459200'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2021-01-01 08:00:00')
    })

    it('应该处理特殊日期：1970-01-01', () => {
      const timestamp = 0
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('1970-01-01 08:00:00')
    })

    it('应该处理闰年日期', () => {
      const timestamp = 1709251200000 // 2024-02-29 00:00:00
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2024-02-29 08:00:00')
    })

    it('应该处理无效时间戳', () => {
      expect(() => convertTimestampToDate('invalid')).toThrow()
      expect(() => convertTimestampToDate('')).toThrow()
      expect(() => convertTimestampToDate('abc123')).toThrow()
    })

    it('应该处理批量转换', () => {
      const timestamps = ['1609459200', '1609459200000', '1709251200000']
      const results = timestamps.map(ts => convertTimestampToDate(ts))
      expect(results).toHaveLength(3)
      expect(results[0]).toBe('2021-01-01 08:00:00')
      expect(results[1]).toBe('2021-01-01 08:00:00')
      expect(results[2]).toBe('2024-02-29 08:00:00')
    })
  })

  describe('日期转时间戳', () => {
    it('应该正确转换日期字符串到时间戳', () => {
      const dateStr = '2021-01-01 00:00:00'
      const result = convertDateToTimestamp(dateStr)
      expect(result).toBe(1609459200000)
    })

    it('应该正确处理ISO日期格式', () => {
      const dateStr = '2021-01-01T00:00:00.000Z'
      const result = convertDateToTimestamp(dateStr)
      expect(result).toBe(1609459200000)
    })

    it('应该正确处理本地日期格式', () => {
      const dateStr = '2021-01-01T00:00:00'
      const result = convertDateToTimestamp(dateStr)
      expect(result).toBeLessThanOrEqual(1609459200000)
      expect(result).toBeGreaterThan(1609459200000 - 1000)
    })

    it('应该处理无效日期', () => {
      expect(() => convertDateToTimestamp('invalid')).toThrow()
      expect(() => convertDateToTimestamp('')).toThrow()
    })

    it('应该处理当前时间', () => {
      const now = new Date()
      const result = convertDateToTimestamp(now.toISOString())
      expect(result).toBe(now.getTime())
    })
  })

  describe('边界条件测试', () => {
    it('应该处理最小时间戳', () => {
      const timestamp = -1
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('1969-12-31 15:59:59')
    })

    it('应该处理极大时间戳', () => {
      const timestamp = 9999999999999 // 2286-11-20
      const result = convertTimestampToDate(timestamp)
      expect(result).toMatch(/2286-11-20/)
    })

    it('应该处理负数时间戳字符串', () => {
      const timestamp = '-1000000000'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('1969-09-27 05:13:20')
    })

    it('应该处理带小数的时间戳', () => {
      expect(() => convertTimestampToDate('1609459200.123')).toThrow()
    })
  })

  describe('精度自动检测', () => {
    it('应该自动识别10位时间戳为秒级', () => {
      const timestamp = '1704038400'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2024-01-01 00:00:00')
    })

    it('应该自动识别13位时间戳为毫秒级', () => {
      const timestamp = '1704038400000'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2024-01-01 00:00:00')
    })

    it('应该自动识别16位时间戳为微秒级', () => {
      const timestamp = '1704038400000000'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2024-01-01 00:00:00')
    })

    it('应该自动识别19位时间戳为纳秒级', () => {
      const timestamp = '1704038400000000000'
      const result = convertTimestampToDate(timestamp)
      expect(result).toBe('2024-01-01 00:00:00')
    })
  })

  describe('批量转换', () => {
    it('应该支持批量时间戳转换', () => {
      const lines = ['1609459200', '1609459200000', '1704038400000']
      const results = lines.map(line => convertTimestampToDate(line))
      expect(results).toHaveLength(3)
    })

    it('应该处理批量转换中的无效值', () => {
      const lines = ['1609459200', 'invalid', '1704038400000']
      const results = lines.map(line => {
        try {
          return convertTimestampToDate(line)
        } catch (e) {
          return 'ERROR'
        }
      })
      expect(results[0]).toBe('2021-01-01 08:00:00')
      expect(results[1]).toBe('ERROR')
      expect(results[2]).toBe('2024-01-01 08:00:00')
    })
  })

  describe('功能集成测试', () => {
    it('时间戳转日期再转时间戳应该一致', () => {
      const originalTimestamp = 1609459200000
      const dateStr = convertTimestampToDate(originalTimestamp)
      const convertedTimestamp = convertDateToTimestamp(dateStr)
      
      // 允许秒级误差（时区转换可能导致）
      expect(Math.abs(convertedTimestamp - originalTimestamp)).toBeLessThan(1000)
    })

    it('日期转时间戳再转日期应该一致', () => {
      const originalDate = '2021-01-01 00:00:00'
      const timestamp = convertDateToTimestamp(originalDate)
      const convertedDate = convertTimestampToDate(timestamp)
      
      expect(convertedDate).toBe('2021-01-01 08:00:00')
    })
  })
})
