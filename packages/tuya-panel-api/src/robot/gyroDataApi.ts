import { TYSdk } from 'tuya-panel-kit';
import {
  IMessage,
  IGetGyroHistoryListOpts,
  IRecordExportList,
  IRecordOriginList,
  IGetGyroMapLatestMediaOpts,
  IGyroMapMediaExport,
  IGetGyroMapHistoryMediaOpts,
  IGyroMapMediaOrigin,
  IStreamData,
  ITransferParams,
} from './interface';

function resolveErr(e: IMessage): Promise<Error> {
  return Promise.reject(new Error(`${e.message || e.errorMsg}`));
}

/** ------------------------------------------------------------------- */
/**
 *  陀螺仪-查询清扫记录列表
 *
 * @param {IGetGyroHistoryListOpts} opt
 * @returns
 */
export function getGyroMapHistoryList(
  opt: IGetGyroHistoryListOpts
): Promise<IRecordExportList | Error> {
  const now = 852048000000;
  const defaultEnd = new Date().getTime();
  const {
    cleanRecordCode = 'clean_record',
    page = 0,
    pageLimit = 10,
    startTime = now,
    endTime = defaultEnd,
  } = opt || {};
  const a = 'tuya.m.sweeper.cleaning.history.get';
  const offset = page * pageLimit;

  const postData = {
    devId: TYSdk.devInfo.devId,
    offset,
    startTime,
    endTime,
    limit: pageLimit,
  };
  const version = '1.0';

  return TYSdk.apiRequest(a, postData, version)
    .then((data: IRecordOriginList) => {
      const { totalCount = 0 } = data;
      if (typeof data.datas === 'undefined' || data.datas.length === 0) {
        return {
          dataList: [],
          hasNext: false,
        };
      }
      const dataList = data.datas.map(({ recordId, value, gmtCreate }) => {
        return {
          id: recordId,
          value,
          timestamp: gmtCreate,
        };
      });

      return {
        dataList,
        hasNext: offset + dataList.length < totalCount,
      };
    })
    .catch(err => {
      return resolveErr(err);
    });
}

/** ------------------------------------------------------------------- */
/**
 * 删除清扫记录
 *
 * @export
 * @param {string[]} ids
 * @returns
 */
export function deleteGyroMapHistoryByIds(ids: string[]): Promise<boolean | Error> {
  const a = 'tuya.m.sweeper.cleaning.history.delete';

  if (!ids || !ids.length) return resolveErr({ message: 'Missing parameters: id' });
  const postData = {
    devId: TYSdk.devInfo.devId,
    uuid: ids.join(','),
  };
  const version = '1.0';

  return TYSdk.apiRequest(a, postData, version)
    .then((success: boolean) => {
      return !!success;
    })
    .catch(err => {
      return resolveErr(err);
    });
}

/** ------------------------------------------------------------------- */

/**
 *  查询最新一次流服务记录详情数据
 *
 * @param {IGetGyroMapLatestMediaOpts} opt
 * @returns
 */
export function getGyroMapLatestMedia(
  opt: IGetGyroMapLatestMediaOpts = {}
): Promise<IGyroMapMediaExport | Error> {
  const { offset = '', limit = 500 } = opt || {};
  const a = 'tuya.m.device.media.latest';

  const postData = {
    devId: TYSdk.devInfo.devId,
    start: offset,
    size: limit,
  };
  const version = '2.0';

  return TYSdk.apiRequest(a, postData, version)
    .then((data: IGyroMapMediaOrigin) => {
      const { dataList = [], subRecordId, startRow, hasNext = false } = data;
      const nextOffset = hasNext ? startRow : '';
      return {
        dataList,
        subRecordId,
        nextOffset,
      };
    })
    .catch(err => {
      return resolveErr(err);
    });
}

/**
 * 查询某次流服务记录详情数据
 *
 * @export
 * @param {IGetGyroMapHistoryMediaOpts} opt
 * @returns
 */
export function getGyroMapHistoryMediaBySubRecordId(
  opt: IGetGyroMapHistoryMediaOpts
): Promise<IGyroMapMediaExport | IMessage> {
  const { subRecordId = '', offset = '', limit = 500 } = opt || {};

  if (!subRecordId) return resolveErr({ code: '', message: 'Missing parameters: subRecordId' });
  const a = 'tuya.m.device.media.detail';

  const postData = {
    devId: TYSdk.devInfo.devId,
    subRecordId,
    start: offset,
    size: limit,
  };
  const version = '2.0';

  return TYSdk.apiRequest(a, postData, version)
    .then((data: IGyroMapMediaOrigin) => {
      const { dataList = [], subRecordId: resSubRecordId, startRow, hasNext } = data;

      const nextOffset = hasNext ? startRow : '';
      return {
        dataList,
        subRecordId: resSubRecordId,
        nextOffset,
      };
    })
    .catch(err => {
      return resolveErr(err);
    });
}

/** ------------------------------------------------------------------- */

/**
 * 陀螺仪地图-获取最新清扫地图v3 (配合流服务v2使用)
 * @returns
 */
export function getGyroMapLatestMediaV3({
  subRecordId,
  start,
  size,
}: ITransferParams): Promise<IStreamData> {
  const startRow = typeof start === 'undefined' ? '' : start;
  return TYSdk.apiRequest(
    'tuya.m.device.media.latest',
    {
      devId: TYSdk.devInfo.devId,
      start: startRow,
      size,
      subRecordId,
      datatype: 0,
    },
    '3.0'
  );
}

/** ------------------------------------------------------------------- */

/** 陀螺仪-获取清扫记录v3 (配合流服务v2使用) */
export function getGyroMapHistoryMediaV3({
  subRecordId,
  mapId,
  start,
  size,
}: ITransferParams): Promise<IStreamData> {
  const startRow = typeof start === 'undefined' ? '' : start;
  return TYSdk.apiRequest(
    'tuya.m.device.media.detail',
    {
      devId: TYSdk.devInfo.devId,
      subRecordId,
      datatype: 0,
      mapId,
      start: startRow,
      size,
    },
    '3.0'
  );
}

/** ------------------------------------------------------------------- */
