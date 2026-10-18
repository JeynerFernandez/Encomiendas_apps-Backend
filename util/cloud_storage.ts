import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'node:util';

// Carga las credenciales una sola vez
const storageClient = new Storage({
    projectId: "app-booking-b30ad", // Reemplaza con tu projectId
    keyFilename: './serviceAccountKey.json' // Asegúrate que la ruta sea correcta desde la raíz del proyecto
});

const bucket = storageClient.bucket("gs://app-booking-b30ad.firebasestorage.app"); // Reemplaza con tu bucket

// Exportamos la función con tipos
export const storage = (file: Express.Multer.File, pathImage: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        
        if (!pathImage) {
            return reject('La ruta de la imagen (pathImage) es requerida.');
        }

        const uuid = uuidv4();
        const fileUpload = bucket.file(pathImage);
        
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype, // Usa el mimetype del archivo original
                metadata: {
                    firebaseStorageDownloadTokens: uuid,
                }
            },
        });

        blobStream.on('error', (error) => {
            console.error('Error al subir archivo a Firebase:', error);
            reject('No se pudo subir el archivo.');
        });

        blobStream.on('finish', () => {
            const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${uuid}`);
            console.log('URL de Cloud Storage:', url);
            resolve(url);
        });

        blobStream.end(file.buffer);
    });
}