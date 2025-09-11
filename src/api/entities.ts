import type { Device } from '@/types/device';
import type { GroupDetails, Groups, LocationDetails, Locations, Tags } from '@/types/entities';
import type { AxiosResponse } from 'axios';

import request from '@/utils/request';

export const entitiesApi = {
  getLocations(): Promise<AxiosResponse<Locations>> {
    return request.get('/entities/locations/');
  },
  getLocationDetails(location: string): Promise<AxiosResponse<LocationDetails>> {
    return request.get(`/entities/locations/${location}/`);
  },
  getGroups(): Promise<AxiosResponse<Groups>> {
    return request.get('/entities/groups/');
  },
  getGroupDetails(entityId: string): Promise<AxiosResponse<GroupDetails>> {
    return request.get(`/entities/groups/${entityId}/`);
  },
  getTags(): Promise<AxiosResponse<Tags>> {
    return request.get('/entities/tags/');
  },
  getTagDetails(tag: string): Promise<AxiosResponse<Device[]>> {
    return request.get(`/entities/tags/${tag}/`);
  },
};
