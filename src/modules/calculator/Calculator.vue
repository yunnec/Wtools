<template>
  <div class="calculator p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">计算器</h2>
    </div>

    <!-- 显示屏 -->
    <div class="mb-4">
      <div class="bg-gray-800 text-white p-6 rounded-lg text-right text-3xl font-mono overflow-hidden">
        {{ display }}
      </div>
      <div class="text-sm text-gray-500 mt-2 text-right">
        {{ history }}
      </div>
    </div>

    <!-- 按钮区域 -->
    <div class="grid grid-cols-4 gap-2">
      <!-- 第一行 -->
      <button @click="clear" class="col-span-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-semibold">
        清空
      </button>
      <button @click="backspace" class="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold">
        退格
      </button>
      <button @click="append('/')" class="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold">
        ÷
      </button>

      <!-- 第二行 -->
      <button @click="append('7')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        7
      </button>
      <button @click="append('8')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        8
      </button>
      <button @click="append('9')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        9
      </button>
      <button @click="append('*')" class="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold">
        ×
      </button>

      <!-- 第三行 -->
      <button @click="append('4')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        4
      </button>
      <button @click="append('5')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        5
      </button>
      <button @click="append('6')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        6
      </button>
      <button @click="append('-')" class="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold">
        -
      </button>

      <!-- 第四行 -->
      <button @click="append('1')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        1
      </button>
      <button @click="append('2')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        2
      </button>
      <button @click="append('3')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        3
      </button>
      <button @click="append('+')" class="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold">
        +
      </button>

      <!-- 第五行 -->
      <button @click="append('0')" class="col-span-2 bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        0
      </button>
      <button @click="append('.')" class="bg-gray-200 hover:bg-gray-300 py-4 rounded-lg font-semibold">
        .
      </button>
      <button @click="calculate" class="bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold">
        =
      </button>
    </div>

    <!-- 高级功能 -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">高级功能</h3>
      <div class="grid grid-cols-4 gap-2">
        <button @click="append('Math.sin(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          sin
        </button>
        <button @click="append('Math.cos(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          cos
        </button>
        <button @click="append('Math.tan(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          tan
        </button>
        <button @click="append('Math.sqrt(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          √
        </button>

        <button @click="append('Math.log(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          log
        </button>
        <button @click="append('Math.log10(')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          log10
        </button>
        <button @click="append('Math.PI')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          π
        </button>
        <button @click="append('Math.E')" class="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded text-sm">
          e
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { eventBus } from '../../core/event'

const display = ref('0')
const history = ref('')
const current = ref('0')
const operator = ref(null)
const previous = ref(null)
const shouldResetDisplay = ref(false)

const append = (value) => {
  if (shouldResetDisplay.value) {
    display.value = '0'
    current.value = '0'
    shouldResetDisplay.value = false
  }

  if (['+', '-', '*', '/'].includes(value)) {
    if (operator.value && previous.value !== null) {
      calculate()
    } else {
      previous.value = parseFloat(current.value)
    }
    operator.value = value
    history.value = `${previous.value} ${operator.value}`
  } else if (value === '.') {
    if (!current.value.includes('.')) {
      current.value += '.'
    }
  } else {
    if (current.value === '0' && value !== '.') {
      current.value = value
    } else {
      current.value += value
    }
  }

  display.value = current.value
}

const calculate = () => {
  const prev = parseFloat(previous.value)
  const currentVal = parseFloat(current.value)

  if (isNaN(prev) || isNaN(currentVal)) return

  let result
  switch (operator.value) {
    case '+':
      result = prev + currentVal
      break
    case '-':
      result = prev - currentVal
      break
    case '*':
      result = prev * currentVal
      break
    case '/':
      if (currentVal === 0) {
        alert('除数不能为零！')
        return
      }
      result = prev / currentVal
      break
    default:
      return
  }

  history.value = `${prev} ${operator.value} ${currentVal} = ${result}`
  display.value = result.toString()
  current.value = result.toString()
  previous.value = null
  operator.value = null
  shouldResetDisplay.value = true

  eventBus.emit('calculator:calculated', {
    expression: history.value,
    result: result
  })
}

const clear = () => {
  display.value = '0'
  current.value = '0'
  history.value = ''
  previous.value = null
  operator.value = null
  shouldResetDisplay.value = false
  eventBus.emit('calculator:cleared', {})
}

const backspace = () => {
  if (current.value.length > 1) {
    current.value = current.value.slice(0, -1)
    display.value = current.value
  } else {
    current.value = '0'
    display.value = '0'
  }
}

onMounted(() => {
  eventBus.on('calculator:calculate', (data) => {
    if (data.expression) {
      try {
        // 安全的数学表达式求值
        const result = Function(`"use strict"; return (${data.expression})`)()
        display.value = result.toString()
        current.value = result.toString()
        history.value = `${data.expression} = ${result}`
      } catch (err) {
        alert('无效的数学表达式')
      }
    }
  })
})
</script>
