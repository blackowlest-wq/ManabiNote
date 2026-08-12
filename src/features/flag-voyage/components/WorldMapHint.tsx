import { findFlagVoyageCountry, type FlagVoyageCountryId } from '../model/flagVoyage'
import worldMapImage from '@svg-maps/world/world.svg?url'

type MapPosition = {
  x: number
  y: number
}

const MAP_POSITION_BY_COUNTRY_ID: Record<FlagVoyageCountryId, MapPosition> = {
  japan: { x: 84.5, y: 53.5 },
  china: { x: 76, y: 52.3 },
  'south-korea': { x: 82.7, y: 53.3 },
  india: { x: 70, y: 60.1 },
  thailand: { x: 75.2, y: 64 },
  indonesia: { x: 79.8, y: 70.6 },
  vietnam: { x: 77.1, y: 64.7 },
  philippines: { x: 81.2, y: 65.7 },
  malaysia: { x: 77.5, y: 68.1 },
  nepal: { x: 71.7, y: 55.4 },
  'united-states': { x: 20, y: 50 },
  canada: { x: 20.1, y: 35 },
  mexico: { x: 18.5, y: 59.2 },
  cuba: { x: 21.2, y: 63.1 },
  brazil: { x: 31.9, y: 75.9 },
  argentina: { x: 29.3, y: 88.1 },
  chile: { x: 26.4, y: 82.3 },
  peru: { x: 27.8, y: 72.9 },
  colombia: { x: 26.1, y: 67.1 },
  'united-kingdom': { x: 46.1, y: 41.2 },
  france: { x: 47.7, y: 47.5 },
  germany: { x: 49.9, y: 44.3 },
  italy: { x: 50.5, y: 50 },
  spain: { x: 45.1, y: 53.3 },
  sweden: { x: 51.9, y: 35.2 },
  switzerland: { x: 49.3, y: 47.2 },
  portugal: { x: 44.1, y: 54.3 },
  netherlands: { x: 48.5, y: 42.2 },
  norway: { x: 49.8, y: 31.8 },
  greece: { x: 52.8, y: 52.8 },
  russia: { x: 69.4, y: 39.2 },
  egypt: { x: 55.6, y: 57.8 },
  'south-africa': { x: 54.6, y: 85.4 },
  kenya: { x: 57.5, y: 69.3 },
  morocco: { x: 44.5, y: 58.1 },
  nigeria: { x: 52.1, y: 67.1 },
  turkey: { x: 56.8, y: 51.7 },
  australia: { x: 84.8, y: 85.4 },
  'new-zealand': { x: 95.6, y: 90.2 },
  fiji: { x: 91.2, y: 74.8 },
}

export function WorldMapHint({ countryId }: { countryId: FlagVoyageCountryId }) {
  const country = findFlagVoyageCountry(countryId)
  if (!country) return null
  const position = MAP_POSITION_BY_COUNTRY_ID[countryId]

  return (
    <figure className="flag-voyage-map-hint">
      <div className="flag-voyage-map-canvas">
        <img src={worldMapImage} alt="国の位置を示す世界地図" draggable={false} />
        <span
          className="flag-voyage-map-pin"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
          aria-label={`${country.name}の位置`}
        >
          📍
        </span>
      </div>
      <figcaption>📍 {country.continent}の このあたり！</figcaption>
      <small>
        Map:{' '}
        <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/world" target="_blank" rel="noreferrer">
          @svg-maps/world (CC BY 4.0)
        </a>
      </small>
    </figure>
  )
}
