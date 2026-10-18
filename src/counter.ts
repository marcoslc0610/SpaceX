import type { Launch } from "./lanzamientos-interface";
import type { Rocket } from "./cohetes-interface";

export class SpaceXApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpaceXApiError";
  }
}

export async function getLanzamientos(url: string): Promise<Launch[]> {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new SpaceXApiError(`Error en el servidor: ${respuesta.status} ${respuesta.statusText}`);
    }
    const lanzamientos: Launch[] = await respuesta.json();
    return lanzamientos;
  } catch (error) {
    if (error instanceof SpaceXApiError) {
      throw error;
    }
    throw new SpaceXApiError("Error de red o conexión al intentar obtener los lanzamientos de SpaceX.");
  }
}

export async function getCohetes(url: string): Promise<Rocket[]> {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);

    const cohetes: Rocket[] = await respuesta.json() as Rocket[];
    return cohetes;
  } catch (error) {
    console.error("Hubo un error al obtener los cohetes:", error);
    throw error;
  }
}