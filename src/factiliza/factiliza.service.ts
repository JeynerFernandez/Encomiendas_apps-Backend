import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

interface FactilizaDniData {
  numero: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string;
}

interface FactilizaDniResponse {
  success: boolean;
  message?: string;
  data?: FactilizaDniData;
}

@Injectable()
export class FactilizaService {

  constructor(
    private readonly configService:
      ConfigService,
  ) {}

  async consultarDni(
    dni: string,
  ): Promise<FactilizaDniData> {

    if (!/^\d{8}$/.test(dni)) {
      throw new BadRequestException(
        'El DNI debe tener 8 dígitos',
      );
    }

    const baseUrl =
      this.configService.get<string>(
        'FACTILIZA_URL',
      );

    const token =
      this.configService.get<string>(
        'FACTILIZA_TOKEN',
      );

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'FACTILIZA_URL no está configurado',
      );
    }

    if (!token) {
      throw new InternalServerErrorException(
        'FACTILIZA_TOKEN no está configurado',
      );
    }

    try {

      const response =
        await fetch(
          `${baseUrl}/${dni}`,
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                'application/json',
            },
          },
        );

      let resultado:
        FactilizaDniResponse | null =
        null;

      try {

        resultado =
          await response.json() as
            FactilizaDniResponse;

      } catch {

        resultado = null;

      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {

        throw new UnauthorizedException(
          'El token de Factiliza no es válido o no está autorizado',
        );

      }

      if (
        response.status === 404
      ) {

        throw new NotFoundException(
          resultado?.message ??
          'El DNI no fue encontrado',
        );

      }

      if (!response.ok) {

        throw new BadGatewayException(
          resultado?.message ??
          'Factiliza devolvió un error',
        );

      }

      if (
        !resultado ||
        !resultado.success ||
        !resultado.data
      ) {

        throw new NotFoundException(
          resultado?.message ??
          'No se encontraron datos para el DNI',
        );

      }

      const data =
        resultado.data;

      if (
        !data.numero ||
        !data.nombres ||
        !data.apellido_paterno ||
        !data.apellido_materno
      ) {

        throw new BadGatewayException(
          'Factiliza devolvió una respuesta incompleta',
        );

      }

      return {
        numero:
          data.numero,

        nombres:
          data.nombres,

        apellido_paterno:
          data.apellido_paterno,

        apellido_materno:
          data.apellido_materno,

        nombre_completo:
          data.nombre_completo,
      };

    } catch (error) {

      if (
        error instanceof
        HttpException
      ) {
        throw error;
      }

      console.error(
        'Error al consultar Factiliza:',
        error,
      );

      throw new BadGatewayException(
        'No se pudo conectar con Factiliza',
      );

    }
  }
}