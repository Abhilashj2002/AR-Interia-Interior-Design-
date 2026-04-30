  void getPackages().catch((error) => {
    console.warn('Initial package sync failed, using local cache fallback:', error);
  });

  // Non-blocking network hydration: refresh local snapshot in the background.
  void Promise.allSettled([
    apiFetch('/categories', {}, 5000).then((response) => (response.ok ? response.json() : null)),
    apiFetch('/designs', {}, 5000).then((response) => (response.ok ? response.json() : null)),
    apiFetch('/packages', {}, 5000).then((response) => (response.ok ? response.json() : null))
  ]).then(([categoriesResult, designsResult, packagesResult]) => {
    const categoriesPayload = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;
    const apiCategories = Array.isArray(categoriesPayload)
      ? categoriesPayload
      : (Array.isArray((categoriesPayload as any)?.categories) ? (categoriesPayload as any).categories : null);

    if (Array.isArray(apiCategories) && apiCategories.length > 0) {
      state.customer.categories = apiCategories.map((cat: any) => normalizeCategoryMotion3D({
        ...cat,
        image: cat.image ? normalizeAssetUrl(cat.image) : cat.image,
        background: cat.background ? normalizeAssetUrl(cat.background) : cat.background,
        thumbnail: cat.thumbnail ? normalizeAssetUrl(cat.thumbnail) : cat.thumbnail,
        images: Array.isArray(cat.images)
          ? cat.images.map((img: any) => ({ ...img, url: img?.url ? normalizeAssetUrl(img.url) : img?.url }))
          : cat.images
      }));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.customer.categories));
      console.log('âœ… Loaded categories from API:', state.customer.categories.length);
    }

    const designsPayload = designsResult.status === 'fulfilled' ? designsResult.value : null;
    const apiDesigns = Array.isArray(designsPayload)
      ? designsPayload
      : (Array.isArray((designsPayload as any)?.designs) ? (designsPayload as any).designs : null);

    if (Array.isArray(apiDesigns) && apiDesigns.length > 0) {
      const mappedDesigns = apiDesigns.map((design: any) => normalizeDesignMotion3D({
        ...design,
        previewImage: design.previewImage ? normalizeAssetUrl(design.previewImage) : design.previewImage,
        images: (() => {
          if (!design.images) return [];
          let rawImages: any = design.images;
          if (typeof design.images === 'string') {
            try {
              rawImages = JSON.parse(design.images);
            } catch {
              rawImages = [];
            }
          }
          return Array.isArray(rawImages) ? rawImages.map((img: string) => normalizeAssetUrl(img)) : [];
        })()
      }));

      const mergedDesigns = mergeDesignsPreferServer(getDesigns(), mappedDesigns);

      state.catalog = mergedDesigns;
      state.customer.designs = mergedDesigns;
      localStorage.setItem(STORAGE_KEYS.designs, JSON.stringify(mergedDesigns));
      localStorage.setItem(STORAGE_KEYS.catalog, JSON.stringify(mergedDesigns));
      console.log('âœ… Loaded designs from API:', mergedDesigns.length);
    }

    // Load packages from API
    const packagesPayload = packagesResult.status === 'fulfilled' ? packagesResult.value : null;
    const apiPackages = Array.isArray(packagesPayload)
      ? packagesPayload
      : (Array.isArray((packagesPayload as any)?.data) ? (packagesPayload as any).data : null);

    if (Array.isArray(apiPackages) && apiPackages.length > 0) {
      writeStorage(STORAGE_KEYS.packages, apiPackages);
      console.log('âœ… Loaded packages from API:', apiPackages.length);
    }

    renderStabilized();
  }).catch((error) => {
    console.warn('Background hydration skipped:', error);
  });

