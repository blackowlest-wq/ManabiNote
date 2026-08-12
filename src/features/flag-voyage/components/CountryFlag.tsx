import { findFlagVoyageCountry, type FlagVoyageCountryId } from '../model/flagVoyage'
import { FLAG_IMAGE_BY_COUNTRY_ID } from './flagImages'

export function CountryFlag({ countryId }: { countryId: FlagVoyageCountryId }) {
  const country = findFlagVoyageCountry(countryId)
  if (!country) return null

  return (
    <img
      className="flag-voyage-flag"
      src={FLAG_IMAGE_BY_COUNTRY_ID[countryId]}
      alt={`${country.name}の国旗`}
      draggable={false}
    />
  )
}
