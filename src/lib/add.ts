/* eslint-disable  @typescript-eslint/no-explicit-any */
type ActorType = 'Object' | 'Oil';

type ActorGeometry = {
  type: 'Point' | 'Polygon';
  coordinates: (number[])[][];
};

type Actor = {
  name?: string;
  density: number;
  color: string;
  type: ActorType;
  url?: string;
  scale?: number;
  geometry: ActorGeometry;
};

type OilSpillData = {
  timestamp: string;
  actors: Actor[];
};

type Output = {
  data: OilSpillData[];
};

export async function formatToOilSpill(
  json: any,
  onStep?: (step: number, total: number, status: 'pending' | 'success' | 'error', message?: string) => void
): Promise<Output> {
  const totalSteps = 4;

  const executeStep = async (
    stepNumber: number,
    stepName: string,
    stepFunction: () => void
  ) => {
    const startTime = Date.now();
    onStep?.(stepNumber, totalSteps, 'pending', stepName);

    try {
      stepFunction();
      const elapsed = Date.now() - startTime;
      if (elapsed < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
      }
      onStep?.(stepNumber, totalSteps, 'success', stepName);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onStep?.(stepNumber, totalSteps, 'error', errorMessage);
      throw error;
    }
  };

  const spills = Array.isArray(json?.spill)
    ? json.spill.map((s: any) => ({ timestamp: s.timestamp, actors: s.actor }))
    : Array.isArray(json?.data)
      ? json.data.map((d: any) => ({ timestamp: d.timestamp, actors: d.actors }))
      : [];

  await executeStep(1, 'Checking timestamps', () => {
    if (!spills.length) {
      throw new Error('Missing or invalid spill/data array');
    }
    const timestamps = spills.map((s: any) => s.timestamp);
    if (!timestamps.length || timestamps.some((t: any) => !t)) {
      throw new Error('Missing timestamps');
    }
  });

  await executeStep(2, 'Checking actors', () => {
    const allActors = spills.every((s: any) => Array.isArray(s.actors) && s.actors.length > 0);
    if (!allActors) {
      throw new Error('Missing actors');
    }
  });

  await executeStep(3, 'Checking for duplicate dates', () => {
    const timestamps = spills.map((s: any) => s.timestamp);
    const dateSet = new Set(timestamps.map((d: any) => new Date(d).getTime()));
    if (dateSet.size !== timestamps.length) {
      throw new Error('Duplicate timestamps found');
    }
  });

  await executeStep(4, 'Checking geometry', () => {
    const allGeometry = spills.every((s: any) =>
      Array.isArray(s.actors) &&
      s.actors.every((a: any) => {
        const type = String(a.type).toLowerCase();

        let hasGeometryCoordinates = false;

        if (a.geometry && a.geometry.type && a.geometry.coordinates !== undefined) {
          if (a.geometry.type === 'Polygon') {
            hasGeometryCoordinates =
              Array.isArray(a.geometry.coordinates) &&
              a.geometry.coordinates.length >= 1 &&
              Array.isArray(a.geometry.coordinates[0]) &&
              a.geometry.coordinates[0].length >= 2 &&
              Array.isArray(a.geometry.coordinates[0][0]);
          } else if (a.geometry.type === 'Point') {
            hasGeometryCoordinates =
              Array.isArray(a.geometry.coordinates) &&
              a.geometry.coordinates.length === 2 &&
              typeof a.geometry.coordinates[0] === 'number' &&
              typeof a.geometry.coordinates[1] === 'number';
          }
        }

        let hasPolygon = false;
        if (Array.isArray(a.polygon)) {
          if (a.polygon.length >= 2) {
            hasPolygon = true;
          } else if (
            a.polygon.length === 1 &&
            Array.isArray(a.polygon[0]) &&
            (a.polygon[0].length === 2 || (a.polygon[0].length === 3 && type === 'object'))
          ) {
            hasPolygon = true;
          }
        }

        const valid = hasGeometryCoordinates || hasPolygon;

        if (!valid) {
          console.warn('Invalid geometry or polygon in actor:', a);
        }

        return valid;
      })
    );

    if (!allGeometry) {
      console.error('Invalid geometry found in actors');
      throw new Error('Invalid geometry values');
    }
  });


  return {
    data: spills.map((spill: any) => {
      const actorArr: Actor[] = [];
      const oilArr: Actor[] = [];

      for (const a of spill.actors || []) {
        const actorType: ActorType = String(a.type).toLowerCase() === 'object' ? 'Object' : 'Oil';

        let geomType: 'Polygon' | 'Point';
        let coordinates: any[][];

        if (
          a.geometry &&
          (a.geometry.type === 'Polygon' || a.geometry.type === 'Point') &&
          Array.isArray(a.geometry.coordinates)
        ) {
          geomType = a.geometry.type;
          coordinates = a.geometry.coordinates;

          if (
            geomType === 'Polygon' &&
            Array.isArray(coordinates[0]) &&
            typeof coordinates[0][0] === 'number'
          ) {
            coordinates = [coordinates];
          }
        } else if (Array.isArray(a.polygon)) {
          const isPoint = a.polygon.length === 1 && typeof a.polygon[0][0] === 'number';
          geomType = isPoint ? 'Point' : 'Polygon';

          coordinates = a.polygon.map((coord: any[]) => coord.map(Number));

          if (
            geomType === 'Polygon' &&
            Array.isArray(coordinates[0]) &&
            typeof coordinates[0][0] === 'number'
          ) {
            coordinates = [coordinates];
          }
        } else {
          geomType = 'Polygon';
          coordinates = [];
        }

        const actorData = {
          density: Number(a.density),
          color: a.color,
          geometry: { type: geomType, coordinates }
        };

        if (actorType === 'Object') {
          actorArr.push({
            ...actorData,
            name: a.name || 'Polygon',
            type: 'Object',
            url: a.url || undefined,
            scale: a.scale !== undefined && a.scale !== '' ? Number(a.scale) : 1
          });
        } else {
          oilArr.push({ ...actorData, type: 'Oil' });
        }
      }

      return {
        timestamp: spill.timestamp,
        actors: [...actorArr, ...oilArr]
      };
    })
  };
}