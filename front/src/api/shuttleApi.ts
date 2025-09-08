import axiosInstance from './axiosInstance';

export type RemainingStop = {
  stopId: string;
  stopName: string;
  estimatedArrivalTime: string;
};

export type UpcomingShuttle = {
  arrivalTimeAtSelectedStop: string;
  remainingRoute: RemainingStop[];
};

export type ShuttleSchedule = {
  selectedStopId: string;
  selectedStopName: string;
  upcomingShuttles: UpcomingShuttle[];
  fullTimeTable: string[];
  fullRoute: { stopId: string; stopName: string }[];
};

export const fetchShuttleSchedule = async (
  stopId: string,
): Promise<ShuttleSchedule> => {
  const url = `/shuttles/schedule/${encodeURIComponent(stopId)}`;
  console.log('[fetchShuttleSchedule] GET', url);
  const res = await axiosInstance.get(url);
  return res.data;
};
