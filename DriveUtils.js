/**
 * Versión mejorada de Guardar Imagen en Drive
 * - Pide permisos más amplios
 * - Crea la carpeta si no existe
 * - Establece permisos públicos automáticamente
 */
function _guardarImagenDrive(base64, nombreArchivo) {
  try {
    // 1. Buscar o crear carpeta
    var folderName = "NannysPeques_Imagenes_Planeacion";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    // Asegurar acceso público a la carpeta (para que se vean las fotos)
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 2. Procesar base64
    var partes = base64.split(",");
    var contentType = "image/jpeg";
    var data = base64;

    if (partes.length > 1) {
      contentType = partes[0].split(":")[1].split(";")[0];
      data = partes[1];
    }

    var decoded = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(decoded, contentType, nombreArchivo);

    // 3. Crear archivo y dar permisos
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 4. Retornar URL directa
    return file.getUrl();
  } catch (e) {
    throw new Error("Error en DriveApp: " + e.message);
  }
}

/**
 * EJECUTA ESTA FUNCIÓN PARA ACTIVAR TODOS LOS PERMISOS
 */
function triggerAuth() {
  // Pedir scopes de lectura, escritura y administración
  DriveApp.getRootFolder();
  DriveApp.getFoldersByName("test");
  var temp = DriveApp.createFile("PERMISO_TEMPORAL.txt", "Autorizando...");
  temp.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  temp.setTrashed(true); // Borrarlo de una vez

  console.log("¡PERMISOS CONCEDIDOS TOTALMENTE! Ahora haz un NUEVO DEPLOY.");
}