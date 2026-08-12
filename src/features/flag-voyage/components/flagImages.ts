import argentina from 'flag-icons/flags/4x3/ar.svg'
import australia from 'flag-icons/flags/4x3/au.svg'
import brazil from 'flag-icons/flags/4x3/br.svg'
import canada from 'flag-icons/flags/4x3/ca.svg'
import chile from 'flag-icons/flags/4x3/cl.svg'
import colombia from 'flag-icons/flags/4x3/co.svg'
import switzerland from 'flag-icons/flags/4x3/ch.svg'
import china from 'flag-icons/flags/4x3/cn.svg'
import cuba from 'flag-icons/flags/4x3/cu.svg'
import germany from 'flag-icons/flags/4x3/de.svg'
import egypt from 'flag-icons/flags/4x3/eg.svg'
import spain from 'flag-icons/flags/4x3/es.svg'
import fiji from 'flag-icons/flags/4x3/fj.svg'
import france from 'flag-icons/flags/4x3/fr.svg'
import greece from 'flag-icons/flags/4x3/gr.svg'
import unitedKingdom from 'flag-icons/flags/4x3/gb.svg'
import indonesia from 'flag-icons/flags/4x3/id.svg'
import india from 'flag-icons/flags/4x3/in.svg'
import italy from 'flag-icons/flags/4x3/it.svg'
import japan from 'flag-icons/flags/4x3/jp.svg'
import kenya from 'flag-icons/flags/4x3/ke.svg'
import malaysia from 'flag-icons/flags/4x3/my.svg'
import morocco from 'flag-icons/flags/4x3/ma.svg'
import southKorea from 'flag-icons/flags/4x3/kr.svg'
import mexico from 'flag-icons/flags/4x3/mx.svg'
import netherlands from 'flag-icons/flags/4x3/nl.svg'
import nigeria from 'flag-icons/flags/4x3/ng.svg'
import norway from 'flag-icons/flags/4x3/no.svg'
import nepal from 'flag-icons/flags/4x3/np.svg'
import newZealand from 'flag-icons/flags/4x3/nz.svg'
import peru from 'flag-icons/flags/4x3/pe.svg'
import philippines from 'flag-icons/flags/4x3/ph.svg'
import portugal from 'flag-icons/flags/4x3/pt.svg'
import russia from 'flag-icons/flags/4x3/ru.svg'
import sweden from 'flag-icons/flags/4x3/se.svg'
import thailand from 'flag-icons/flags/4x3/th.svg'
import turkey from 'flag-icons/flags/4x3/tr.svg'
import unitedStates from 'flag-icons/flags/4x3/us.svg'
import southAfrica from 'flag-icons/flags/4x3/za.svg'
import vietnam from 'flag-icons/flags/4x3/vn.svg'
import type { FlagVoyageCountryId } from '../model/flagVoyage'

export const FLAG_IMAGE_BY_COUNTRY_ID: Readonly<Record<FlagVoyageCountryId, string>> = {
  argentina,
  australia,
  brazil,
  canada,
  chile,
  china,
  colombia,
  cuba,
  egypt,
  fiji,
  france,
  germany,
  greece,
  india,
  indonesia,
  italy,
  japan,
  kenya,
  malaysia,
  mexico,
  morocco,
  nepal,
  netherlands,
  nigeria,
  norway,
  'new-zealand': newZealand,
  peru,
  philippines,
  portugal,
  russia,
  'south-africa': southAfrica,
  'south-korea': southKorea,
  spain,
  sweden,
  switzerland,
  thailand,
  turkey,
  'united-kingdom': unitedKingdom,
  'united-states': unitedStates,
  vietnam,
}
