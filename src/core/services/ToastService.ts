import { ref } from 'vue'

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

class ToastServiceImpl {
  private toasts = ref<ToastItem[]>([])

  /**
   * 显示Toast提示
   */
  show(options: ToastOptions): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.toasts.value.push({
      id,
      type: options.type || 'success',
      title: options.title,
      message: options.message,
      duration: options.duration || 3000
    })

    return id
  }

  /**
   * 关闭Toast
   */
  close(id: string) {
    const index = this.toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      this.toasts.value.splice(index, 1)
    }
  }

  /**
   * 关闭所有Toast
   */
  closeAll() {
    this.toasts.value = []
  }

  /**
   * 获取Toast列表
   */
  getToasts() {
    return this.toasts.value
  }

  /**
   * 显示成功提示
   */
  success(title: string, message?: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration })
  }

  /**
   * 显示错误提示
   */
  error(title: string, message?: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration: duration || 5000 })
  }

  /**
   * 显示警告提示
   */
  warning(title: string, message?: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration })
  }

  /**
   * 显示信息提示
   */
  info(title: string, message?: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration })
  }

  /**
   * 复制成功提示
   */
  copySuccess(text?: string) {
    return this.success('复制成功', text ? `已复制: ${text}` : undefined)
  }

  /**
   * 复制失败提示
   */
  copyError() {
    return this.error('复制失败', '请手动选择复制')
  }
}

export const toastService = new ToastServiceImpl()
export default toastService
