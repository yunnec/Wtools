/**
 * E2E测试：主流程测试
 * 测试用户从打开应用到使用工具的完整流程
 */

import { test, expect } from '@playwright/test'

test.describe('梧桐工具箱 E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 打开应用
    await page.goto('http://localhost:5173')
    await expect(page.locator('h1')).toContainText('梧桐工具箱')
  })

  test('应该显示所有工具模块', async ({ page }) => {
    // 检查主页显示
    await expect(page.locator('h2')).toContainText('选择工具')

    // 检查工具模块卡片
    const toolCards = page.locator('.card')
    await expect(toolCards).toHaveCount(10) // 9个工具 + 1个示例插件

    // 检查特定工具存在
    await expect(page.locator('text=文件管理器')).toBeVisible()
    await expect(page.locator('text=文本编辑器')).toBeVisible()
    await expect(page.locator('text=计算器')).toBeVisible()
    await expect(page.locator('text=JSON工具')).toBeVisible()
  })

  test('应该能搜索工具', async ({ page }) => {
    // 在搜索框输入"计算"
    await page.fill('input[placeholder="搜索工具..."]', '计算')

    // 等待搜索结果
    await page.waitForTimeout(500)

    // 检查搜索结果
    const searchResults = page.locator('text=搜索结果')
    await expect(searchResults).toBeVisible()

    // 验证只显示匹配的工具
    const toolCards = page.locator('.card')
    await expect(toolCards).toHaveCount(1) // 只有计算器匹配
  })

  test('应该能打开和关闭工具模块', async ({ page }) => {
    // 点击计算器卡片
    await page.click('text=计算器')
    await page.click('text=打开')

    // 等待模块加载
    await page.waitForSelector('text=计算器', { state: 'visible' })
    await expect(page.locator('h2')).toContainText('计算器')

    // 检查"返回主页"按钮
    await expect(page.locator('text=← 返回主页')).toBeVisible()

    // 点击返回主页
    await page.click('text=← 返回主页')

    // 验证回到主页
    await expect(page.locator('h1')).toContainText('梧桐工具箱')
    await expect(page.locator('h2')).toContainText('选择工具')
  })

  test('应该支持主题切换', async ({ page }) => {
    // 点击主题切换按钮
    const themeButton = page.locator('button[title*="切换到"]')
    await themeButton.click()

    // 验证主题切换
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)

    // 再次点击切换回来
    await themeButton.click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('应该支持键盘快捷键', async ({ page }) => {
    // 按Escape键（如果当前在模块中）
    // 这个测试主要验证快捷键不会报错
    await page.keyboard.press('Escape')

    // 使用Ctrl+K打开搜索
    await page.keyboard.press('Control+k')

    // 搜索框应该获得焦点
    const searchInput = page.locator('input[placeholder="搜索工具..."]')
    await expect(searchInput).toBeFocused()
  })
})

test.describe('工具模块功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('计算器工具应该能工作', async ({ page }) => {
    // 打开计算器
    await page.click('text=计算器')
    await page.click('text=打开')

    // 点击数字和运算符
    await page.click('button:has-text("5")')
    await page.click('button:has-text("+")')
    await page.click('button:has-text("3")')
    await page.click('button:has-text("=")')

    // 验证结果
    const display = page.locator('.calculator-display')
    await expect(display).toContainText('8')
  })

  test('JSON工具应该能工作', async ({ page }) => {
    // 打开JSON工具
    await page.click('text=JSON工具')
    await page.click('text=打开')

    // 输入JSON
    const inputArea = page.locator('textarea').first()
    await inputArea.fill('{"name":"测试","age":30}')

    // 点击格式化
    await page.click('button:has-text("格式化")')

    // 验证格式化结果
    const outputArea = page.locator('textarea').last()
    await expect(outputArea).toContainText('{')
    await expect(outputArea).toContainText('"name"')
  })

  test('Base64工具应该能工作', async ({ page }) => {
    // 打开Base64工具
    await page.click('text=Base64工具')
    await page.click('text=打开')

    // 输入文本
    const inputArea = page.locator('textarea').first()
    await inputArea.fill('Hello World')

    // 点击编码
    await page.click('button:has-text("编码")')

    // 验证编码结果
    const outputArea = page.locator('textarea').last()
    await expect(outputArea).toContainText('SGVsbG8gV29ybGQ=')
  })

  test('颜色选择器应该能工作', async ({ page }) => {
    // 打开颜色选择器
    await page.click('text=颜色选择器')
    await page.click('text=打开')

    // 检查颜色选择器界面
    await expect(page.locator('text=颜色选择器')).toBeVisible()
    await expect(page.locator('input[type="color"]')).toBeVisible()
  })
})

test.describe('响应式设计测试', () => {
  test('应该在移动端正常显示', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173')

    // 检查主页
    await expect(page.locator('h1')).toContainText('梧桐工具箱')

    // 检查工具卡片在移动端的布局
    const toolCards = page.locator('.card')
    await expect(toolCards).toHaveCount(10)
  })

  test('应该在平板端正常显示', async ({ page }) => {
    // 模拟平板设备
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('http://localhost:5173')

    // 检查主页
    await expect(page.locator('h1')).toContainText('梧桐工具箱')
  })
})

test.describe('插件系统测试', () => {
  test('示例插件应该能正常工作', async ({ page }) => {
    // 打开插件商店
    await page.click('text=插件商店')
    await page.click('text=打开')

    // 检查插件商店界面
    await expect(page.locator('text=插件商店')).toBeVisible()
    await expect(page.locator('text=浏览、安装和管理插件')).toBeVisible()

    // 打开示例插件
    await page.click('text=← 返回主页')
    await page.click('text=示例插件')
    await page.click('text=打开')

    // 检查示例插件界面
    await expect(page.locator('text=示例插件')).toBeVisible()
    await expect(page.locator('text=这是一个示例插件')).toBeVisible()
  })
})
