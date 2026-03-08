import { IBaseResponse, IResponse } from 'src/types/interfaces';

export class AppError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: any;

  constructor(message: string, statusCode = 500, errorCode?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class BaseResponse {
  static success<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Success', ...cfg.option };
    if (!cfg.res) return { success: true, ...option } as unknown as T;
    return cfg.res.status(200).json({ success: true, ...option }) as T;
  }


  static error<T>(cfg: IBaseResponse = {}): T {
    const { statusCode } = cfg.err
    switch (statusCode) {
      case 400: return this.invalid(cfg);
      case 401: return this.unauthorized(cfg);
      case 403: return this.forbidden(cfg);
      case 404: return this.notFound(cfg);
      case 409: return this.conflict(cfg);
      default: return this.unexpected(cfg);
    }
  }


  static unauthorized<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Unauthorized', error_code: '401', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 401, option.error_code, cfg.err);
    return cfg.res.status(401).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

  static forbidden<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Forbidden', error_code: '403', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 403, option.error_code, cfg.err);
    return cfg.res.status(403).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

  static notFound<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Data Not Found', error_code: '404', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 404, option.error_code, cfg.err);
    return cfg.res.status(404).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

  static conflict<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Data Already Exist', error_code: '409', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 409, option.error_code, cfg.err);
    return cfg.res.status(409).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

  static invalid<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Invalid Request', error_code: '400', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 400, option.error_code, cfg.err);
    return cfg.res.status(400).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

  static unexpected<T>(cfg: IBaseResponse = {}): T {
    const option: IResponse = { message: 'Internal Server Error', error_code: '500', ...cfg.option };
    console.error(option, cfg.err);
    if (!cfg.res) throw new AppError(option.message!, 500, option.error_code, cfg.err);
    return cfg.res.status(500).json({ success: false, message: cfg?.err?.message ?? option.message, error_code: option.error_code }) as T;
  }

}
