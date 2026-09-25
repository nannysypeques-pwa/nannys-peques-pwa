/**
 * SUPABASE STORAGE UPLOADER
 * Maneja la subida directa de imágenes y archivos a Supabase Storage
 * 100% independiente de Google Drive y Google Apps Script.
 */

/**
 * Convierte base64 o Data URL a Blob binario de forma eficiente
 */
function _base64ToBlob(base64Data, fallbackMime = 'image/jpeg') {
    if (base64Data instanceof Blob) return base64Data;
    let mime = fallbackMime;
    let b64 = base64Data;
    if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const parts = base64Data.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) mime = mimeMatch[1];
        b64 = parts[1];
    }
    const byteCharacters = atob(b64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mime });
}

/**
 * Sube una imagen directamente a Supabase Storage y retorna su URL pública accesible
 * @param {string|Blob} dataOrBase64 Imagen en base64, Data URL o Blob
 * @param {string} nombreArchivo Nombre deseado para el archivo
 * @param {string} bucketName Nombre del bucket en Supabase (por defecto 'evidencias')
 * @returns {Promise<string>} URL pública permanente de Supabase Storage
 */
async function subirImagenSupabaseStorage(dataOrBase64, nombreArchivo, bucketName = 'evidencias') {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) {
        throw new Error("Cliente de Supabase no inicializado.");
    }

    if (!client.storage) {
        throw new Error("El módulo de Supabase Storage no está disponible en el cliente.");
    }

    const cleanName = (nombreArchivo || `img_${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = _base64ToBlob(dataOrBase64);
    const mimeType = blob.type || 'image/jpeg';

    console.log(`☁️ [Supabase Storage] Subiendo archivo "${cleanName}" al bucket "${bucketName}" (${Math.round(blob.size / 1024)} KB)...`);

    const { data, error } = await client.storage
        .from(bucketName)
        .upload(cleanName, blob, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error("❌ Error subiendo a Supabase Storage:", error);
        throw new Error(`Supabase Storage [${error.statusCode || 'Error'}]: ${error.message || 'Error al subir imagen'}`);
    }

    const { data: publicData } = client.storage.from(bucketName).getPublicUrl(cleanName);
    let finalUrl = publicData?.publicUrl || '';

    // Si el bucket es privado o requiere acceso seguro, generamos un signedUrl de larga duración (10 años)
    try {
        const { data: signedData, error: signErr } = await client.storage
            .from(bucketName)
            .createSignedUrl(cleanName, 315360000);
        if (!signErr && signedData && signedData.signedUrl) {
            finalUrl = signedData.signedUrl;
        }
    } catch (signEx) {
        console.warn("⚠️ [Supabase Storage] Fallback a publicUrl:", signEx);
    }

    if (!finalUrl) {
        throw new Error("No se pudo obtener la URL accesible de Supabase Storage.");
    }

    console.log("✅ [Supabase Storage] Imagen subida exitosamente:", finalUrl);
    return finalUrl;
}

/**
 * Resuelve una URL de imagen para garantizar que se pueda renderizar en un <img> o visor.
 * Si es de Supabase Storage y es privada o devuelve error, genera un signedUrl o Blob URL.
 */
async function obtenerUrlVisualizable(url) {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;

    // Soporte para enlaces directos de Google Drive
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
        }
    }

    // Soporte para URLs de Supabase Storage
    if (url.includes('supabase.co/storage/v1/object/')) {
        try {
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && client.storage) {
                const match = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#]+)\/([^?#]+)/);
                if (match) {
                    const bucket = match[1];
                    const filePath = decodeURIComponent(match[2]);
                    const { data: signedData, error } = await client.storage
                        .from(bucket)
                        .createSignedUrl(filePath, 315360000);
                    if (!error && signedData?.signedUrl) {
                        return signedData.signedUrl;
                    }
                    const { data: blobData, error: dlErr } = await client.storage.from(bucket).download(filePath);
                    if (!dlErr && blobData) {
                        return URL.createObjectURL(blobData);
                    }
                }
            }
        } catch (e) {
            console.warn("⚠️ [Supabase Storage] Error resolviendo URL:", e);
        }
    }

    return url;
}

/**
 * Manejador de error para elementos <img> con evidencias o fotos de actividades.
 * Reintenta la carga mediante URL firmada de Supabase o Google Drive.
 */
async function manejarErrorImagenEvidencia(imgElement, originalUrl) {
    if (!imgElement || imgElement._hasHandledError) return;
    imgElement._hasHandledError = true;

    try {
        const fallbackUrl = await obtenerUrlVisualizable(originalUrl || imgElement.src);
        if (fallbackUrl && fallbackUrl !== imgElement.src && fallbackUrl !== originalUrl) {
            imgElement.src = fallbackUrl;
            const parent = imgElement.closest('.evidencia-thumb-container') || imgElement.parentElement;
            if (parent) {
                parent.setAttribute('onclick', `abrirVisualizador('${fallbackUrl}', this)`);
            }
            return;
        }
    } catch (e) {
        console.warn("⚠️ Error en fallback de imagen:", e);
    }
}

/**
 * Comprime y redimensiona una imagen (File, Blob o Data URL) usando HTML5 Canvas.
 * Es 100% seguro y no destructivo: si no es imagen o falla, devuelve la entrada original.
 * @param {File|Blob|string} imageSource - Archivo, Blob o Data URL base64.
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1280] - Límite de ancho en píxeles.
 * @param {number} [options.maxHeight=1280] - Límite de alto en píxeles.
 * @param {number} [options.quality=0.8] - Calidad JPEG (0.1 a 1.0).
 * @param {string} [options.outputType='image/jpeg'] - Formato MIME ('image/jpeg').
 * @returns {Promise<{ base64: string, blob: Blob, width: number, height: number, sizeKB: number }>}
 */
async function comprimirImagen(imageSource, options = {}) {
    const {
        maxWidth = 1280,
        maxHeight = 1280,
        quality = 0.8,
        outputType = 'image/jpeg'
    } = options;

    if (!imageSource) {
        return { base64: '', blob: null, width: 0, height: 0, sizeKB: 0 };
    }

    const getDataUrl = () => {
        return new Promise((resolve, reject) => {
            if (typeof imageSource === 'string') {
                resolve(imageSource);
            } else if (imageSource instanceof Blob || imageSource instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(imageSource);
            } else {
                reject(new Error("Formato de imagen no compatible"));
            }
        });
    };

    try {
        const srcDataUrl = await getDataUrl();

        if (!srcDataUrl || (!srcDataUrl.startsWith('data:image/') && !srcDataUrl.startsWith('blob:'))) {
            const fallbackBlob = _base64ToBlob(srcDataUrl);
            return {
                base64: srcDataUrl,
                blob: fallbackBlob,
                width: 0,
                height: 0,
                sizeKB: Math.round((fallbackBlob?.size || 0) / 1024)
            };
        }

        return await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;

                if (w > maxWidth || h > maxHeight) {
                    if (w / maxWidth > h / maxHeight) {
                        h = Math.round((h * maxWidth) / w);
                        w = maxWidth;
                    } else {
                        w = Math.round((w * maxHeight) / h);
                        h = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, w);
                canvas.height = Math.max(1, h);
                const ctx = canvas.getContext('2d');

                if (outputType === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressedBase64 = canvas.toDataURL(outputType, quality);
                const compressedBlob = _base64ToBlob(compressedBase64, outputType);

                console.log(`🖼️ [Compresión] ${img.width}x${img.height} ➔ ${canvas.width}x${canvas.height} | Peso: ~${Math.round(compressedBlob.size / 1024)} KB`);

                resolve({
                    base64: compressedBase64,
                    blob: compressedBlob,
                    width: canvas.width,
                    height: canvas.height,
                    sizeKB: Math.round(compressedBlob.size / 1024)
                });
            };

            img.onerror = () => {
                console.warn("⚠️ [Compresión] Error al cargar imagen en Canvas, usando fallback original.");
                const fbBlob = _base64ToBlob(srcDataUrl);
                resolve({
                    base64: srcDataUrl,
                    blob: fbBlob,
                    width: 0,
                    height: 0,
                    sizeKB: Math.round((fbBlob?.size || 0) / 1024)
                });
            };

            img.src = srcDataUrl;
        });
    } catch (err) {
        console.warn("⚠️ [Compresión] Excepción durante compresión:", err);
        const fbBlob = _base64ToBlob(imageSource);
        return {
            base64: typeof imageSource === 'string' ? imageSource : '',
            blob: fbBlob,
            width: 0,
            height: 0,
            sizeKB: Math.round((fbBlob?.size || 0) / 1024)
        };
    }
}

window.comprimirImagen = comprimirImagen;
window.subirImagenSupabaseStorage = subirImagenSupabaseStorage;
window._base64ToBlob = _base64ToBlob;
window.obtenerUrlVisualizable = obtenerUrlVisualizable;
window.manejarErrorImagenEvidencia = manejarErrorImagenEvidencia;

