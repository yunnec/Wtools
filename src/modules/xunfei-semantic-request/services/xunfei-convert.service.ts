/**
 * 讯飞语义请求 - 转换服务
 * 调用转换接口获取最终结果
 */

export interface ConvertServiceConfig {
  convertApiUrl: string
  convertAuthToken: string
  convertApplicationId: string
  convertSupplier?: number
  convertVersion?: string
}

export interface ConvertResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * 转换服务类
 */
export class XunfeiConvertService {
  private config: ConvertServiceConfig

  constructor(config: ConvertServiceConfig) {
    this.config = {
      convertSupplier: 0,
      convertVersion: 'lastest',
      ...config
    }
  }

  /**
   * 调用转换接口
   */
  async convert(originData: string): Promise<ConvertResult> {
    try {
      console.log('[ConvertService] 开始转换请求')
      console.log('[ConvertService] 原始数据长度:', originData.length)

      const requestBody = {
        appId: this.config.convertApplicationId,
        supplier: this.config.convertSupplier,
        version: this.config.convertVersion,
        origin: originData
      }

      console.log('[ConvertService] 请求参数:', {
        appId: requestBody.appId,
        supplier: requestBody.supplier,
        version: requestBody.version,
        origin长度: requestBody.origin.length
      })

      const response = await fetch(this.config.convertApiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'zh-CN',
          'authorization': `Bearer ${this.config.convertAuthToken}`,
          'content-type': 'application/json;charset=UTF-8',
          'request-start': Date.now().toString(),
          'x-requested-with': 'XMLHttpRequest',
          'Referer': 'https://test.auto-pai.cn/'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('[ConvertService] 响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ConvertService] 转换失败:', errorText)
        return {
          success: false,
          error: `转换请求失败: ${response.status} ${response.statusText}`
        }
      }

      const result = await response.json()
      console.log('[ConvertService] 转换结果:', result)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      console.error('[ConvertService] 转换异常:', errorMessage)
      return {
        success: false,
        error: `转换异常: ${errorMessage}`
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ConvertServiceConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ConvertServiceConfig {
    return { ...this.config }
  }
}
