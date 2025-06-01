declare global {
  interface Global {
    openFavoriteBottomSheet?: () => void;
    closeFavoriteBottomSheet?: () => void;
  }

  var openFavoriteBottomSheet: (() => void) | undefined;
  var closeFavoriteBottomSheet: (() => void) | undefined;
}

export {};
