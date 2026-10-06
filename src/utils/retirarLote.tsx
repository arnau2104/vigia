export async function retirarLote(lote_id: number): Promise<boolean> {
   try{

    const res = await fetch('/api/retirarLote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lote_id })
        })
        const data = await res.json();

        console.log("reuslt uodate", res.ok &&!data.error)

    return res.ok &&!data.error; // si las dos condiciones son verdaderas, devolvera true
   
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        return false;
    }
}