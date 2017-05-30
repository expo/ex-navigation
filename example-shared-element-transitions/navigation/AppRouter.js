/**
 * @providesModule AppRouter
 */

import { createRouter } from '@exponent/ex-navigation';

import PlacesList from 'PlacesList';
import PlaceDetail from 'PlaceDetail';

const AppRouter = createRouter(() => ({
  placesList: () => PlacesList,
  placeDetail: () => PlaceDetail,
}));

export default AppRouter;
