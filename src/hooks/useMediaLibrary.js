import { useState, useEffect, useCallback, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform, Linking, AppState } from 'react-native';

const PAGE_SIZE = 20;

// Resolves ph:// URIs to local file:// URIs on iOS
async function resolveUri(asset) {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    return { ...asset, uri: info.localUri || info.uri || asset.uri };
  } catch {
    return asset;
  }
}

export function useMediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [trashBin, setTrashBin] = useState([]);
  const [allDone, setAllDone] = useState(false);

  const endCursorRef = useRef(null);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        Alert.alert(
          'İzin Gerekli',
          'Galeri temizleme için fotoğraf erişim izni gereklidir.',
          [{ text: 'Tamam' }]
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      loadAssets();
    }
  }, [hasPermission]);

  const resolveAssets = async (rawAssets) => {
    const resolved = await Promise.all(rawAssets.map(resolveUri));
    return resolved;
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      const result = await MediaLibrary.getAssetsAsync({
        first: PAGE_SIZE,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const resolved = await resolveAssets(result.assets);
      setAssets(resolved);
      setTotalCount(result.totalCount);
      endCursorRef.current = result.endCursor;
      hasMoreRef.current = result.hasNextPage;
      setCurrentIndex(0);
      setAllDone(result.totalCount === 0);
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('Hata', 'Fotoğraflar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAssets = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: PAGE_SIZE,
        after: endCursorRef.current,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const resolved = await resolveAssets(result.assets);
      setAssets(prev => [...prev, ...resolved]);
      endCursorRef.current = result.endCursor;
      hasMoreRef.current = result.hasNextPage;
    } catch (error) {
      console.error('Error loading more assets:', error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (currentIndex >= assets.length - 3 && hasMoreRef.current) {
      loadMoreAssets();
    }
  }, [currentIndex, assets.length, loadMoreAssets]);

  const currentAsset = assets[currentIndex] || null;
  const nextAsset = assets[currentIndex + 1] || null;

  const keepPhoto = useCallback(() => {
    if (!currentAsset) return;
    setKeptCount(prev => prev + 1);
    if (currentIndex + 1 >= assets.length && !hasMoreRef.current) {
      setAllDone(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentAsset, currentIndex, assets.length]);

  const deletePhoto = useCallback(async () => {
    if (!currentAsset) return;
    try {
      setTrashBin(prev => [...prev, currentAsset]);
      await MediaLibrary.deleteAssetsAsync([currentAsset.id]);
      setDeletedCount(prev => prev + 1);
      setAssets(prev => prev.filter((_, i) => i !== currentIndex));
      if (assets.length <= 1 && !hasMoreRef.current) {
        setAllDone(true);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      setTrashBin(prev => prev.slice(0, -1));
      Alert.alert('Hata', 'Fotoğraf silinirken bir hata oluştu. Lütfen silme iznini onaylayın.');
    }
  }, [currentAsset, currentIndex, assets.length]);

  const undoDelete = useCallback(async () => {
    if (trashBin.length === 0) {
      Alert.alert('Geri Alma', 'Geri alınacak fotoğraf yok.');
      return false;
    }

    const lastDeleted = trashBin[trashBin.length - 1];
    Alert.alert(
      'Son Silinen ↩️',
      `"${lastDeleted.filename}"\n\niOS: Fotoğraflar > Son Silinenler klasöründen kurtarabilirsiniz.\nAndroid: Çöp kutusu > son silinenler klasöründen kurtarabilirsiniz.`,
      [{ text: 'Tamam' }]
    );
    setTrashBin(prev => prev.slice(0, -1));
    setDeletedCount(prev => Math.max(0, prev - 1));
    return true;
  }, [trashBin]);

  const doReset = useCallback(() => {
    // Show loading spinner immediately — prevents flash of "Gallery Empty" screen
    // during the gap between clearing assets and loadAssets() populating them.
    setLoading(true);
    setAssets([]);
    setCurrentIndex(0);
    setDeletedCount(0);
    setKeptCount(0);
    setTrashBin([]);
    setAllDone(false);
    endCursorRef.current = null;
    hasMoreRef.current = false;
    loadingMoreRef.current = false;
    loadAssets();
  }, []);

  const resetAll = useCallback(() => {
    Alert.alert(
      'Tekrar Başla',
      'Nasıl devam etmek istersiniz?',
      [
        {
          // Merges "Mevcut Erişimle Devam" + "Fotoğraf Seçimini Değiştir":
          // On iOS, opens the photo picker so user can adjust selection (or just tap Done to keep current).
          // On Android, just resets directly.
          text: 'Tekrar Başla',
          onPress: () => {
            if (Platform.OS === 'ios') {
              // Set up library change listener BEFORE opening picker.
              // This is the ONLY reliable signal that iOS has committed
              // the user's new photo selection to its database.
              const subscription = MediaLibrary.addListener(() => {
                subscription.remove();
                // 500ms buffer for iOS to fully finish committing
                setTimeout(doReset, 500);
              });

              // Fire and forget — do NOT await.
              // On some iOS versions the promise resolves immediately
              // (before user taps Done), which breaks await-based approaches.
              MediaLibrary.presentPermissionsPickerAsync().catch(() => {
                // Full access already granted — no picker shown
                subscription.remove();
                doReset();
              });

              // Safety cleanup: if user cancels without changing anything,
              // remove the listener after 2 minutes to prevent memory leak.
              setTimeout(() => subscription.remove(), 120000);
            } else {
              doReset();
            }
          },
        },
        {
          // iOS cannot upgrade limited → full access programmatically.
          // The only way is to send the user to the Settings app.
          text: 'Tüm Galeriye Erişim Ver',
          onPress: async () => {
            const subscription = AppState.addEventListener('change', (nextState) => {
              if (nextState === 'active') {
                subscription.remove();
                doReset();
              }
            });
            await Linking.openSettings();
          },
        },
        {
          text: 'İptal',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, [doReset]);

  return {
    currentAsset,
    nextAsset,
    loading,
    hasPermission,
    totalCount,
    deletedCount,
    keptCount,
    processedCount: deletedCount + keptCount,
    trashBin,
    allDone,
    keepPhoto,
    deletePhoto,
    undoDelete,
    resetAll,
    canUndo: trashBin.length > 0,
  };
}
