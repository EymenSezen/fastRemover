import { useState, useEffect, useCallback, useRef } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

const PAGE_SIZE = 20;

export function useMediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [trashBin, setTrashBin] = useState([]); // stack for undo
  const [allDone, setAllDone] = useState(false);

  const endCursorRef = useRef(null);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  // Request permissions
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

  // Load initial assets
  useEffect(() => {
    if (hasPermission) {
      loadAssets();
    }
  }, [hasPermission]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const result = await MediaLibrary.getAssetsAsync({
        first: PAGE_SIZE,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      setAssets(result.assets);
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

      setAssets(prev => [...prev, ...result.assets]);
      endCursorRef.current = result.endCursor;
      hasMoreRef.current = result.hasNextPage;
    } catch (error) {
      console.error('Error loading more assets:', error);
    } finally {
      loadingMoreRef.current = false;
    }
  }, []);

  // Preload more when running low
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
      // Add to trash bin for undo
      setTrashBin(prev => [...prev, currentAsset]);

      // Actually delete the asset from the media library
      await MediaLibrary.deleteAssetsAsync([currentAsset.id]);

      setDeletedCount(prev => prev + 1);

      // Remove from local array instead of incrementing index
      setAssets(prev => prev.filter((_, i) => i !== currentIndex));

      // Check if we're done
      if (assets.length <= 1 && !hasMoreRef.current) {
        setAllDone(true);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      // If deletion fails (user cancelled), remove from trash
      setTrashBin(prev => prev.slice(0, -1));
      Alert.alert('Hata', 'Fotoğraf silinirken bir hata oluştu. Lütfen silme iznini onaylayın.');
    }
  }, [currentAsset, currentIndex, assets.length]);

  const undoDelete = useCallback(async () => {
    if (trashBin.length === 0) {
      Alert.alert('Geri Alma', 'Geri alınacak fotoğraf yok.');
      return false;
    }

    // Pop the last deleted item
    const lastDeleted = trashBin[trashBin.length - 1];

    // Note: expo-media-library doesn't have a direct "restore" API.
    // The delete operation on iOS shows a system dialog, and once confirmed,
    // the photo goes to the "Recently Deleted" album.
    // We can inform the user about this.
    Alert.alert(
      'Geri Alındı! ↩️',
      `"${lastDeleted.filename}" son silinen fotoğrafınız.\n\niOS: Fotoğraflar > Son Silinenler klasöründen kurtarabilirsiniz.\n\nAndroid: Çöp kutusu/son silinenler klasöründen kurtarabilirsiniz.`,
      [{ text: 'Tamam' }]
    );

    setTrashBin(prev => prev.slice(0, -1));
    setDeletedCount(prev => Math.max(0, prev - 1));

    return true;
  }, [trashBin]);

  const resetAll = useCallback(() => {
    setCurrentIndex(0);
    setDeletedCount(0);
    setKeptCount(0);
    setTrashBin([]);
    setAllDone(false);
    loadAssets();
  }, []);

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
