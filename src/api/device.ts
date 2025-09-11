import type { Device, DeviceDevice, Devices } from '@/types/device';
import type { AxiosResponse } from 'axios';

import request from '@/utils/request';

export const deviceApi = {
  getDevices(params?: Record<string, string>): Promise<AxiosResponse<Devices>> {
    return request.get('/devices/', { params });
  },
  getDevice(entityId: string): Promise<AxiosResponse<DeviceDevice>> {
    return request.get(`/devices/${entityId}/`);
  },
  patchDevice(deviceID: string, device_details: Partial<Device>): Promise<AxiosResponse<Device>> {
    return request.patch(`/devices/${deviceID}/`, device_details);
  },
};
