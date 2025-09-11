import type { AlarmSetting, AlarmSettingsData, GetAlarmRecordApi } from '@/types/alarm';
import type { DeviceAlarm } from '@/types/device';
import type { AxiosResponse } from 'axios';

import request from '@/utils/request';

export const alarmApi = {
  getAlarmsSetting(): Promise<AxiosResponse<AlarmSettingsData>> {
    return request.get('/alarms/settings/');
  },
  postAlarmSetting(data: AlarmSetting[]) {
    return request.post('/alarms/settings/', data);
  },
  postAlarmRecords(params: string, data: { action: string; operation: string }) {
    return request.post(`/alarms/records/${params}/actions/`, data);
  },
  patchAlarmSetting(id: string, data: DeviceAlarm) {
    return request.patch(`/alarms/settings/${id}/`, data);
  },
  patchAlarmSettingBatch(data: AlarmSetting[]) {
    return request.patch(`/alarms/settings/batch/`, data);
  },

  // alarm record
  getDeviceAlarmRecords(id: string): Promise<AxiosResponse<GetAlarmRecordApi>> {
    return request.get(`/devices/${id}/alarm-records/`);
  },
};
