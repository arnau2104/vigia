import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, retraso = 300): T {
  const [valorRetrasado, setValorRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setValorRetrasado(valor), retraso)
    return () => clearTimeout(temporizador) // si el valor cambia antes, cancela el anterior
  }, [valor, retraso])

  return valorRetrasado
}