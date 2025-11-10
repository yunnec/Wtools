/**
 * 讯飞语义请求 - 认证服务
 * 处理SHA256签名、Base64编码和认证参数构建
 */

export interface XunfeiAuthParams {
  appId: string
  checksum: string
  curtime: string
  param: string
  signtype: string
}

export interface XunfeiConfig {
  apiKey: string
  authId: string
  dataType: string
  interactMode: string
  resultLevel: string
  scene: string
  closeDelay: string
  deviceId: string
  speechClientVer: string
  startAsrNum: string
  vin: string
  voiceActiveDetect: string
  aiStatus: string
}

/**
 * 认证服务类
 */
export class XunfeiAuthService {
  private config: XunfeiConfig

  constructor(config: XunfeiConfig) {
    this.config = config
  }

  /**
   * 构建认证参数
   * 根据讯飞API文档构建认证所需的参数
   */
  async buildAuthParams(query: string): Promise<XunfeiAuthParams> {
    // 构建用户参数
    const userParams = {
      deviceId: this.config.deviceId,
      dialogueId: '',
      hotWords: '',
      speechClientVer: this.config.speechClientVer,
      speechId: '',
      startAsrNum: this.config.startAsrNum,
      vin: this.config.vin,
      voice_active_detect: this.config.voiceActiveDetect,
      wtAppId: this.config.apiKey, // 使用APIKey作为wtAppId
      AI_STATUS: this.config.aiStatus
    }

    const userParamsBase64 = this.encodeBase64(JSON.stringify(userParams))

    // 构建AIUI参数
    const aiuiParams = {
      auth_id: this.config.authId,
      close_delay: this.config.closeDelay,
      data_type: this.config.dataType,
      interact_mode: this.config.interactMode,
      result_level: this.config.resultLevel,
      scene: this.config.scene,
      userparams: userParamsBase64
    }

    const paramBase64 = this.encodeBase64(JSON.stringify(aiuiParams))

    // 获取当前时间戳（秒）
    const curtime = Math.floor(Date.now() / 1000).toString()

    // 计算checksum: SHA256(APIKEY + curtime + paramBase64)
    const originStr = this.config.apiKey + curtime + paramBase64
    const checksum = await this.calculateSHA256(originStr)

    return {
      appId: '', // appId在URL参数中单独设置
      checksum,
      curtime,
      param: paramBase64,
      signtype: 'sha256'
    }
  }

  /**
   * 计算SHA256哈希值
   * 使用Web Crypto API进行SHA256计算
   */
  async calculateSHA256(data: string): Promise<string> {
    try {
      // 将字符串转换为ArrayBuffer
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      // 计算哈希
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)

      // 转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const checksum = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      return checksum
    } catch (error) {
      console.error('SHA256计算失败:', error)
      throw new Error('SHA256计算失败: ' + (error as Error).message)
    }
  }

  /**
   * Base64编码
   * 使用btoa进行Base64编码
   */
  encodeBase64(data: string): string {
    try {
      return btoa(unescape(encodeURIComponent(data)))
    } catch (error) {
      console.error('Base64编码失败:', error)
      throw new Error('Base64编码失败: ' + (error as Error).message)
    }
  }

  /**
   * Base64解码
   * 使用atob进行Base64解码
   */
  decodeBase64(data: string): string {
    try {
      return decodeURIComponent(escape(atob(data)))
    } catch (error) {
      console.error('Base64解码失败:', error)
      throw new Error('Base64解码失败: ' + (error as Error).message)
    }
  }

  /**
   * 验证配置
   * 检查必要参数是否完整
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.apiKey) {
      errors.push('API密钥不能为空')
    }
    if (!this.config.authId) {
      errors.push('认证ID不能为空')
    }
    if (!this.config.dataType) {
      errors.push('数据类型不能为空')
    }
    if (!this.config.interactMode) {
      errors.push('交互模式不能为空')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<XunfeiConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): XunfeiConfig {
    return { ...this.config }
  }
}
