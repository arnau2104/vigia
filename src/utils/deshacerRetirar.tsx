import type { LoteView } from '../types/lote'
interface ResultadoDeshacer {
  ok: boolean
  lote?: LoteView   // opcional: en el catch no hay lote
}


export async function deshacerRetirar(lote_id: number): Promise<ResultadoDeshacer> {
   try { 
        const res = await fetch('/api/deshacerRetirar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lote_id }),
        })

        const data = await res.json();

        return {ok: res.ok && !data.error, lote: data.lote[0]}; // si las dos condiciones son verdaderas, devolvera true

    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return {ok: false};
    }
    
}