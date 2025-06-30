export const getBoundingBox = (
  coordinates: {latitude: number; longitude: number}[],
) => {
  if (coordinates.length === 0) {
    throw new Error('좌표 배열이 비어있습니다.');
  }

  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;

  coordinates.forEach(coord => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLon = Math.min(minLon, coord.longitude);
    maxLon = Math.max(maxLon, coord.longitude);
  });

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    deltaLat: maxLat - minLat,
    deltaLon: maxLon - minLon,
  };
};
