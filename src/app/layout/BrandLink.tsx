import { Link } from 'react-router';

import { Logo, Text } from '@/shared/ui';

import { HOME_PATH } from '../flow';

/** Isotype and «Declara tu renta», linking to Inicio (side rail and the 210 top bar). */
export const BrandLink = () => (
  <Link
    to={HOME_PATH}
    className='flex shrink-0 items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-line-action'
  >
    <Logo version='isotype' size={28} decorative />
    <Text as='span' variant='title-m'>
      Declara tu renta
    </Text>
  </Link>
);
