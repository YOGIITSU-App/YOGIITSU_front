declare global {
  interface Global {
    openFavoriteBottomSheet?: () => void;
  }

  var openFavoriteBottomSheet: () => void;
}

export {};
