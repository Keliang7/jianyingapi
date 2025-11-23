// src/common/interfaces/response.interface.ts
export interface ApiResponse<T = any> {
  code: number; // 状态码（200 成功，-1 失败）
  message: string; // 提示信息
  data?: T | null; // 数据内容
  timestamp?: string; // 时间戳
  path?: string; // 请求路径（错误时可能用到）
}
