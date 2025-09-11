import type { CaliData } from '@/types/calibration';
import type { DatainsightsHistoryParams, Statistics } from '@/types/datainsight';
import type { Measure } from '@/types/measure';
import type { AxiosResponse } from 'axios';

import request from '@/utils/request';

export const datainsightsApi = {
  getLatestMeasure(ids: string): Promise<AxiosResponse<{ data: Measure[] }>> {
    return request.get('/datainsights/latest-measure/', { params: { ids } });
  },
  getLatestCalibration(ids: string): Promise<AxiosResponse<{ data: CaliData[] }>> {
    return request.get('/datainsights/latest-calibration/', { params: { ids } });
  },
  getMeasureHistory(params: DatainsightsHistoryParams) {
    return request.get('/datainsights/measure-history/', { params });
  },
  getCalibrationHistory(params: DatainsightsHistoryParams) {
    return request.get('/datainsights/calibration-history/', { params });
  },
  getStatistics(ids: string): Promise<AxiosResponse<Statistics>> {
    return request.get('/datainsights/statistics/', { params: { ids } });
  },
};
