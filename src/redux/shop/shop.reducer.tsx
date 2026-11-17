import { ShopActionTypes, ShopState } from './shop.types';

const initialState: ShopState = {
  categories: [],
  featured: [],
  latest: [],
  products: [],
  product: null,
  images: [],
  related: [],
  inWishlist: false,
  loading: false,
  error: null,
};

export default function shopReducer(state = initialState, action: any): ShopState {
  switch (action.type) {
    case ShopActionTypes.FETCH_HOME_REQUEST:
    case ShopActionTypes.FETCH_PRODUCTS_REQUEST:
    case ShopActionTypes.FETCH_PRODUCT_REQUEST:
      return { ...state, loading: true, error: null };
    case ShopActionTypes.FETCH_HOME_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload.categories || [],
        featured: action.payload.featured || [],
        latest: action.payload.latest || [],
      };
    case ShopActionTypes.FETCH_PRODUCTS_SUCCESS:
      return { ...state, loading: false, products: action.payload || [] };
    case ShopActionTypes.FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        product: action.payload.product,
        images: action.payload.images || [],
        related: action.payload.related || [],
        inWishlist: !!action.payload.inWishlist,
      };
    case ShopActionTypes.FETCH_HOME_FAILURE:
    case ShopActionTypes.FETCH_PRODUCTS_FAILURE:
    case ShopActionTypes.FETCH_PRODUCT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
