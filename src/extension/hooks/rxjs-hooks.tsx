import { useEffect, useState } from "react"
import { Observable } from "rxjs"

export function useObservable<T>(
	observable: Observable<T>,
	next: (item: T) => void,
	error?: (error: any) => void,
	complete?: () => void,
) {
	useEffect(() => {
		const sub = observable.subscribe({
			next,
			error,
			complete,
		})

		return () => {
			sub.unsubscribe()
		}
	}, [])
}

export function useObservableValue<T>(
	observable: Observable<T>,
	initialValue: T,
) {
	const [value, setValue] = useState<T>(initialValue)

	useObservable(observable, (newValue) => {
		setValue(newValue)
	})

	return value
}
