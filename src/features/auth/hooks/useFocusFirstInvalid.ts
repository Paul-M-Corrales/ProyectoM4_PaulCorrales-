import { useEffect, type RefObject } from 'react'

/** Lleva el foco al primer campo inválido cada vez que un envío falla la validación. */
export function useFocusFirstInvalid(formRef: RefObject<HTMLFormElement | null>, tick: number) {
  useEffect(() => {
    if (tick === 0) return
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [formRef, tick])
}
