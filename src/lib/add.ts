type ActorType = 'Object' | 'Oil';

type ActorGeometry = {
  type: 'Point' | 'Polygon';
  coordinates: (number[])[];
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

export function formatToOilSpill(json: any): Output {
  if (!json || !Array.isArray(json.spill)) return { data: [] };

  return {
    data: json.spill.map((spill: any) => {
      const actorArr: Actor[] = [];
      const oilArr: Actor[] = [];

      for (const a of spill.actor || []) {
        const actorType: ActorType = String(a.type).toLowerCase() === 'object' ? 'Object' : 'Oil';
        const geomType: 'Polygon' | 'Point' =
          Array.isArray(a.polygon) && a.polygon.length === 1 ? 'Point' : 'Polygon';
        const coordinates = Array.isArray(a.polygon)
          ? a.polygon.map((coord: any[]) => coord.map(Number))
          : [];

        if (actorType === 'Object') {
          actorArr.push({
            name: a.name || 'Polygon',
            density: Number(a.density),
            color: a.color,
            type: 'Object',
            url: a.url || undefined,
            scale: a.scale !== undefined && a.scale !== '' ? Number(a.scale) : 1,
            geometry: { type: geomType, coordinates }
          });
        } else {
          oilArr.push({
            density: Number(a.density),
            color: a.color,
            type: 'Oil',
            geometry: { type: geomType, coordinates }
          });
        }
      }

      return {
        timestamp: spill.timestamp,
        actors: [...actorArr, ...oilArr]
      };
    })
  };
}
