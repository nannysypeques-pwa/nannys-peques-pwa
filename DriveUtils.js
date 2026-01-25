/**
 * FORCE DRIVE SCOPE (No borrar esta línea):
 * DriveApp.getFoldersByName(""); 
 * 
 * Versión mejorada de Guardar Imagen en Drive con TRACE de errores
 */
function _guardarImagenDrive(base64, nombreArchivo) {
  try {
    // 1. Verificar si DriveApp está disponible
    if (typeof DriveApp === 'undefined') {
      throw new Error("El servicio de Drive (DriveApp) no está habilitado en este proyecto.");
    }

    // 2. Buscar o crear carpeta
    var folderName = "NannysPeques_Imagenes_Planeacion";
    var folder;

    try {
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
    } catch (e) {
      throw new Error("Error específico de permisos al acceder a carpetas: " + e.message);
    }

    // Asegurar acceso público
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 3. Procesar base64
    var partes = base64.split(",");
    var contentType = "image/jpeg";
    var data = base64;

    if (partes.length > 1) {
      contentType = partes[0].split(":")[1].split(";")[0];
      data = partes[1];
    }

    var decoded = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(decoded, contentType, nombreArchivo);

    // 4. Crear archivo y dar permisos
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Retornar URL directa
    console.log("Imagen guardada con éxito en Drive: " + file.getUrl());
    return file.getUrl();
  } catch (e) {
    console.error("Fallo crítico en _guardarImagenDrive: " + e.toString());
    throw new Error("No se pudo guardar la imagen: " + e.message);
  }
}

/**
 * EJECUTA ESTA FUNCIÓN PARA ACTIVAR TODOS LOS PERMISOS
 */
function triggerAuth() {
  DriveApp.getRootFolder();
  DriveApp.getFiles();
  DriveApp.getFoldersByName("test");
  var temp = DriveApp.createFile("PERMISO_TEMPORAL.txt", "Autorizando...");
  temp.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  temp.setTrashed(true);

  console.log("¡PERMISOS CONCEDIDOS! Ahora ve a 'Deploy' -> 'Nueva implementación' y despliega de nuevo.");
}