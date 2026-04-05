import { open as openShp } from 'shapefile';
import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/geodata');
const MAP_DIR = resolve(ROOT, 'map_data');

function isUpToDate(outFile, ...srcFiles) {
  if (!existsSync(outFile)) return false;
  const outMtime = statSync(outFile).mtimeMs;
  return srcFiles.every(f => {
    try { return statSync(f).mtimeMs < outMtime; } catch { return false; }
  });
}

async function readShapefile(shpPath, propertyFilter, featureFilter = () => true) {
  const source = await openShp(shpPath);
  const features = [];
  let result;
  while (!(result = await source.read()).done) {
    const feature = result.value;
    if (!feature || !feature.geometry) continue;
    if (!featureFilter(feature.properties)) continue;
    features.push({
      type: 'Feature',
      geometry: feature.geometry,
      properties: propertyFilter(feature.properties),
    });
  }
  return { type: 'FeatureCollection', features };
}

async function convertCountries() {
  const shpPath = `${MAP_DIR}/ne_50m_admin_0_countries/ne_50m_admin_0_countries.shp`;
  const outPath = `${OUT_DIR}/countries.geojson`;
  if (isUpToDate(outPath, shpPath)) {
    console.log('  countries.geojson — up to date, skipping');
    return;
  }
  const geojson = await readShapefile(
    shpPath,
    (p) => ({ NAME: p.NAME, ADM0_A3: p.ADM0_A3, SOVEREIGNT: p.SOVEREIGNT }),
  );
  writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`  countries.geojson — wrote ${geojson.features.length} features`);
}

async function convertPorts() {
  const shpPath = `${MAP_DIR}/ne_10m_ports/ne_10m_ports.shp`;
  const outPath = `${OUT_DIR}/ports.geojson`;
  if (isUpToDate(outPath, shpPath)) {
    console.log('  ports.geojson — up to date, skipping');
    return;
  }
  const geojson = await readShapefile(
    shpPath,
    (p) => ({ name: p.name, scalerank: p.scalerank }),
    (p) => p.scalerank <= 6,
  );
  writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`  ports.geojson — wrote ${geojson.features.length} features`);
}

async function convertCities() {
  const shpPath = `${MAP_DIR}/ne_50m_populated_places_simple/ne_50m_populated_places_simple.shp`;
  const outPath = `${OUT_DIR}/cities.geojson`;
  if (isUpToDate(outPath, shpPath)) {
    console.log('  cities.geojson — up to date, skipping');
    return;
  }
  const geojson = await readShapefile(
    shpPath,
    (p) => ({ name: p.name, adm0name: p.adm0name, pop_max: p.pop_max, rank_max: p.rank_max }),
    (p) => p.rank_max >= 10,
  );
  writeFileSync(outPath, JSON.stringify(geojson));
  console.log(`  cities.geojson — wrote ${geojson.features.length} features`);
}

function parseGpkgGeometry(blob) {
  // GeoPackage binary header: 2 bytes magic + 1 version + 1 flags + 4 srs_id = 8 bytes
  const flags = blob[3];
  const envelopeType = (flags & 0x0E) >> 1; // bits 1-3
  // Envelope sizes in bytes: 0=none, 1=XY(32), 2=XYZ(48), 3=XYM(48), 4=XYZM(64)
  const envelopeSizes = [0, 32, 48, 48, 64];
  const envelopeSize = envelopeSizes[envelopeType] ?? 0;
  const wkbOffset = 8 + envelopeSize;

  const byteOrder = blob[wkbOffset]; // 0=big-endian, 1=little-endian
  const readUint32 = byteOrder === 0
    ? (o) => blob.readUInt32BE(o)
    : (o) => blob.readUInt32LE(o);
  const readDouble = byteOrder === 0
    ? (o) => blob.readDoubleBE(o)
    : (o) => blob.readDoubleLE(o);

  const geomType = readUint32(wkbOffset + 1);

  // LINESTRING = 2, MULTILINESTRING = 5
  if (geomType === 2) {
    const numPoints = readUint32(wkbOffset + 5);
    const coords = [];
    for (let i = 0; i < numPoints; i++) {
      const lon = readDouble(wkbOffset + 9 + i * 16);
      const lat = readDouble(wkbOffset + 9 + i * 16 + 8);
      coords.push([lon, lat]);
    }
    if (coords.length < 2) return null;
    return [coords]; // wrap in array for uniform handling
  }

  if (geomType === 5) {
    // MULTILINESTRING: 4-byte count, then each is a WKB LINESTRING
    const numLines = readUint32(wkbOffset + 5);
    const lineStrings = [];
    let offset = wkbOffset + 9;
    for (let l = 0; l < numLines; l++) {
      // Each component WKB: 1 byte order + 4 type + 4 numPoints + n*16 coords
      const lsByteOrder = blob[offset];
      const lsReadUint32 = lsByteOrder === 0
        ? (o) => blob.readUInt32BE(o)
        : (o) => blob.readUInt32LE(o);
      const lsReadDouble = lsByteOrder === 0
        ? (o) => blob.readDoubleBE(o)
        : (o) => blob.readDoubleLE(o);
      const numPoints = lsReadUint32(offset + 5);
      const coords = [];
      for (let i = 0; i < numPoints; i++) {
        const lon = lsReadDouble(offset + 9 + i * 16);
        const lat = lsReadDouble(offset + 9 + i * 16 + 8);
        coords.push([lon, lat]);
      }
      if (coords.length >= 2) lineStrings.push(coords);
      offset += 9 + numPoints * 16;
    }
    return lineStrings.length > 0 ? lineStrings : null;
  }

  return null;
}

function convertMarnet() {
  const gpkgPath = `${MAP_DIR}/marnet_plus_100km.gpkg`;
  const outPath = `${OUT_DIR}/maritime-routes.geojson`;

  if (!existsSync(gpkgPath)) {
    console.log('  maritime-routes.geojson — marnet.gpkg not found, skipping');
    return;
  }
  if (isUpToDate(outPath, gpkgPath)) {
    console.log('  maritime-routes.geojson — up to date, skipping');
    return;
  }

  const db = new Database(gpkgPath, { readonly: true });

  // Find the geometry table (not gpkg_ system tables)
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'gpkg_%' AND name NOT LIKE 'rtree_%' AND name NOT LIKE 'sqlite_%'"
  ).all().map(r => r.name);

  if (tables.length === 0) {
    console.log('  maritime-routes.geojson — no geometry table found in gpkg, skipping');
    db.close();
    return;
  }

  const tableName = tables[0];
  console.log(`  Using gpkg table: "${tableName}"`);

  // Find the geometry column name
  const cols = db.prepare(`PRAGMA table_info("${tableName}")`).all().map(r => r.name);
  const geomCol = cols.find(c => c !== 'fid' && c !== 'rowid') ?? 'geom';

  const rows = db.prepare(`SELECT "${geomCol}" FROM "${tableName}"`).all();
  db.close();

  const features = [];
  for (const row of rows) {
    const blob = row[geomCol];
    if (!blob) continue;
    const lineStrings = parseGpkgGeometry(blob);
    if (!lineStrings) continue;
    for (const coords of lineStrings) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      });
    }
  }

  writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`  maritime-routes.geojson — wrote ${features.length} line features`);
}

// Main
mkdirSync(OUT_DIR, { recursive: true });
console.log('Converting geodata...');
await Promise.all([convertCountries(), convertPorts(), convertCities()]);
convertMarnet();
console.log('Done.');
