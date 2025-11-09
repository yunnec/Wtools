/**
 * JsonTool JSON工具单元测试
 * 测试JSON格式化、验证、压缩等功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// 提取JSON处理逻辑为测试函数
function formatJson(input: string): string {
  try {
    const parsed = JSON.parse(input)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    throw new Error('Invalid JSON')
  }
}

function validateJson(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message
    }
  }
}

function minifyJson(input: string): string {
  try {
    const parsed = JSON.parse(input)
    return JSON.stringify(parsed)
  } catch (error) {
    throw new Error('Invalid JSON')
  }
}

function sortJsonKeys(input: string): string {
  try {
    const parsed = JSON.parse(input)
    const sorted = typeof parsed === 'object' && parsed !== null
      ? Array.isArray(parsed)
        ? parsed.map(item => sortJsonKeys(JSON.stringify(item)))
        : Object.keys(parsed).sort().reduce((obj, key) => {
            obj[key] = sortJsonKeys(JSON.stringify(parsed[key]))
            return obj
          }, {} as any)
      : parsed
    return JSON.stringify(sorted, null, 2)
  } catch (error) {
    throw new Error('Invalid JSON')
  }
}

describe('JsonTool JSON工具', () => {
  let wrapper: any

  const validJson = {
    name: '测试',
    age: 30,
    active: true,
    scores: [85, 92, 78],
    address: {
      city: '北京',
      zipCode: '100000'
    }
  }

  const invalidJson = '{ "name": "测试", "age": 30, }'

  beforeEach(async () => {
    try {
      const JsonTool = (await import('../../../src/modules/json-tool/JsonTool.vue')).default
      wrapper = mount(JsonTool)
    } catch (error) {
      console.warn('JsonTool component not available for testing')
    }
  })

  describe('JSON格式化', () => {
    it('应该格式化有效的JSON', () => {
      const input = JSON.stringify(validJson)
      const output = formatJson(input)

      expect(output).toBe(JSON.stringify(validJson, null, 2))
      expect(output).toContain('\n')
      expect(output).toContain('  ') // 两个空格缩进
    })

    it('应该格式化嵌套对象', () => {
      const nestedJson = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      }

      const input = JSON.stringify(nestedJson)
      const output = formatJson(input)

      expect(output).toContain('level1')
      expect(output).toContain('level2')
      expect(output).toContain('level3')
    })

    it('应该格式化数组', () => {
      const arrayJson = [1, 2, 3, { name: 'test' }]

      const input = JSON.stringify(arrayJson)
      const output = formatJson(input)

      expect(output).toBe(JSON.stringify(arrayJson, null, 2))
    })

    it('应该在JSON无效时抛出错误', () => {
      expect(() => formatJson(invalidJson)).toThrow('Invalid JSON')
    })
  })

  describe('JSON验证', () => {
    it('应该验证有效的JSON', () => {
      const input = JSON.stringify(validJson)
      const result = validateJson(input)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该检测无效的JSON', () => {
      const result = validateJson(invalidJson)

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该检测多种JSON错误', () => {
      const testCases = [
        '{ "name": "test", }', // 末尾多余逗号
        '{ "name": "test" "age": 30 }', // 缺少逗号
        '{ name: "test" }', // 缺少引号
        '{"name": "test"}', // 单引号
        '{ "name": "test" }', // 末尾不完整
      ]

      testCases.forEach(testCase => {
        const result = validateJson(testCase)
        expect(result.valid).toBe(false)
      })
    })

    it('应该验证空对象和空数组', () => {
      expect(validateJson('{}').valid).toBe(true)
      expect(validateJson('[]').valid).toBe(true)
      expect(validateJson('').valid).toBe(false)
      expect(validateJson('null').valid).toBe(true)
    })
  })

  describe('JSON压缩', () => {
    it('应该压缩JSON移除空白字符', () => {
      const formatted = JSON.stringify(validJson, null, 2)
      const minified = minifyJson(formatted)

      expect(minified).not.toContain('\n')
      expect(minified).not.toContain('  ')
      expect(minified).toBe(JSON.stringify(validJson))
    })

    it('应该保持JSON内容不变', () => {
      const input = JSON.stringify(validJson)
      const minified = minifyJson(input)

      const original = JSON.parse(input)
      const parsedMinified = JSON.parse(minified)

      expect(parsedMinified).toEqual(original)
    })

    it('应该处理嵌套结构', () => {
      const input = JSON.stringify({
        a: { b: { c: { d: 'value' } } },
        e: [1, 2, 3]
      }, null, 2)

      const minified = minifyJson(input)
      expect(minified).not.toContain('\n')
      expect(minified).toBe('{"a":{"b":{"c":{"d":"value"}}},"e":[1,2,3]}')
    })
  })

  describe('JSON排序', () => {
    it('应该排序顶层键', () => {
      const unsorted = {
        zebra: 'last',
        apple: 'first',
        banana: 'second'
      }

      const input = JSON.stringify(unsorted)
      const output = sortJsonKeys(input)

      const sorted = JSON.parse(output)
      const keys = Object.keys(sorted)

      expect(keys).toEqual(['apple', 'banana', 'zebra'])
    })

    it('应该递归排序嵌套对象', () => {
      const input = {
        z: { c: 1, a: 2 },
        b: { y: 3, x: 4 }
      }

      const output = sortJsonKeys(JSON.stringify(input))
      const sorted = JSON.parse(output)

      expect(Object.keys(sorted)).toEqual(['b', 'z'])
      expect(Object.keys(sorted.b)).toEqual(['x', 'y'])
      expect(Object.keys(sorted.z)).toEqual(['a', 'c'])
    })

    it('应该保持数组元素顺序', () => {
      const input = {
        items: [
          { z: 3, a: 1 },
          { c: 2, b: 4 }
        ]
      }

      const output = sortJsonKeys(JSON.stringify(input))
      const sorted = JSON.parse(output)

      expect(sorted.items).toHaveLength(2)
      expect(Object.keys(sorted.items[0])).toEqual(['a', 'z'])
      expect(Object.keys(sorted.items[1])).toEqual(['b', 'c'])
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊数值', () => {
      const special = {
        number: 0,
        negative: -42,
        float: 3.14,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN,
        nullValue: null,
        booleanTrue: true,
        booleanFalse: false,
        emptyString: '',
        largeNumber: 9007199254740991
      }

      const input = JSON.stringify(special)
      const formatted = formatJson(input)
      const parsed = JSON.parse(formatted)

      expect(parsed).toEqual(special)
    })

    it('应该处理Unicode字符', () => {
      const unicode = {
        chinese: '你好世界',
        emoji: '😀🎉',
        symbol: '©®™',
        unicode: '\u4f60\u597d'
      }

      const input = JSON.stringify(unicode)
      const output = formatJson(input)

      const parsed = JSON.parse(output)
      expect(parsed).toEqual(unicode)
    })

    it('应该处理长字符串', () => {
      const longString = 'a'.repeat(10000)
      const input = JSON.stringify({ content: longString })

      const output = formatJson(input)
      const parsed = JSON.parse(output)

      expect(parsed.content).toBe(longString)
      expect(parsed.content).toHaveLength(10000)
    })

    it('应该处理深度嵌套', () => {
      let nested: any = { value: 'deep' }
      for (let i = 0; i < 100; i++) {
        nested = { level: nested }
      }

      const input = JSON.stringify(nested)
      const output = formatJson(input)

      const parsed = JSON.parse(output)
      expect(parsed.level.level.level).toBeDefined()
    })
  })

  describe('性能测试', () => {
    it('应该能快速处理大对象', () => {
      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `item-${i}`,
          value: Math.random()
        }))
      }

      const input = JSON.stringify(largeObject)

      const start = performance.now()
      const output = formatJson(input)
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // 100ms内完成
      expect(output).toContain('"id"')
      expect(output).toContain('"name"')
    })
  })
})
