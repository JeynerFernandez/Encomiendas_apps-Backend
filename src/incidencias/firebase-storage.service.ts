import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  Storage,
} from '@google-cloud/storage';

import {
  randomUUID,
} from 'node:crypto';

@Injectable()
export class FirebaseStorageService {

  private readonly storageClient =
    new Storage({
      projectId: 'app-booking-b30ad',
      keyFilename: './serviceAccountKey.json',
    });

  private readonly bucket =
    this.storageClient.bucket(
      'app-booking-b30ad.firebasestorage.app',
    );

  async uploadIncidencia(
    file: Express.Multer.File | undefined,
  ): Promise<string> {

    if (!file) {
      throw new BadRequestException(
        'La imagen de la incidencia es obligatoria',
      );
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !tiposPermitidos.includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPG, JPEG, PNG o WEBP',
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {
      throw new BadRequestException(
        'La imagen no puede superar los 5 MB',
      );
    }

    try {

      const uuid =
        randomUUID();

      const extension =
        this.obtenerExtension(
          file.mimetype,
        );

      const pathImage =
        `incidencias/${randomUUID()}.${extension}`;

      const fileUpload =
        this.bucket.file(
          pathImage,
        );

      const blobStream =
        fileUpload.createWriteStream({
          metadata: {
            contentType:
              file.mimetype,

            metadata: {
              firebaseStorageDownloadTokens:
                uuid,
            },
          },
        });

      return await new Promise<string>(
        (
          resolve,
          reject,
        ) => {

          blobStream.on(
            'error',
            (error) => {

              console.error(
                'Error al subir archivo a Firebase:',
                error,
              );

              reject(
                new InternalServerErrorException(
                  'No se pudo subir el archivo',
                ),
              );

            },
          );

          blobStream.on(
            'finish',
            () => {

              const url =
                `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${uuid}`;

              console.log(
                'URL de Cloud Storage:',
                url,
              );

              resolve(
                url,
              );

            },
          );

          blobStream.end(
            file.buffer,
          );

        },
      );

    } catch (error) {

      if (
        error instanceof
        BadRequestException
      ) {
        throw error;
      }

      if (
        error instanceof
        InternalServerErrorException
      ) {
        throw error;
      }

      console.error(
        'Error al subir imagen:',
        error,
      );

      throw new InternalServerErrorException(
        'No se pudo subir la imagen a Firebase Storage',
      );

    }
  }

  private obtenerExtension(
    mimetype: string,
  ): string {

    switch (
      mimetype
    ) {

      case 'image/png':
        return 'png';

      case 'image/webp':
        return 'webp';

      case 'image/jpeg':
        return 'jpg';

      default:
        return 'jpg';

    }
  }

}