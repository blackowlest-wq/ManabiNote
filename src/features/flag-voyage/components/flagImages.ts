import argentina from 'flag-icons/flags/4x3/ar.svg'
import australia from 'flag-icons/flags/4x3/au.svg'
import brazil from 'flag-icons/flags/4x3/br.svg'
import canada from 'flag-icons/flags/4x3/ca.svg'
import switzerland from 'flag-icons/flags/4x3/ch.svg'
import china from 'flag-icons/flags/4x3/cn.svg'
import germany from 'flag-icons/flags/4x3/de.svg'
import egypt from 'flag-icons/flags/4x3/eg.svg'
import spain from 'flag-icons/flags/4x3/es.svg'
import france from 'flag-icons/flags/4x3/fr.svg'
import unitedKingdom from 'flag-icons/flags/4x3/gb.svg'
import indonesia from 'flag-icons/flags/4x3/id.svg'
import india from 'flag-icons/flags/4x3/in.svg'
import italy from 'flag-icons/flags/4x3/it.svg'
import japan from 'flag-icons/flags/4x3/jp.svg'
import kenya from 'flag-icons/flags/4x3/ke.svg'
import southKorea from 'flag-icons/flags/4x3/kr.svg'
import mexico from 'flag-icons/flags/4x3/mx.svg'
import newZealand from 'flag-icons/flags/4x3/nz.svg'
import sweden from 'flag-icons/flags/4x3/se.svg'
import thailand from 'flag-icons/flags/4x3/th.svg'
import turkey from 'flag-icons/flags/4x3/tr.svg'
import unitedStates from 'flag-icons/flags/4x3/us.svg'
import southAfrica from 'flag-icons/flags/4x3/za.svg'
import type { FlagVoyageCountryId } from '../model/flagVoyage'

export const FLAG_IMAGE_BY_COUNTRY_ID: Readonly<Record<FlagVoyageCountryId, string>> = {
  argentina,
  australia,
  brazil,
  canada,
  china,
  egypt,
  france,
  germany,
  india,
  indonesia,
  italy,
  japan,
  kenya,
  mexico,
  'new-zealand': newZealand,
  'south-africa': southAfrica,
  'south-korea': southKorea,
  spain,
  sweden,
  switzerland,
  thailand,
  turkey,
  'united-kingdom': unitedKingdom,
  'united-states': unitedStates,
}
