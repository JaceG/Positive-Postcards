import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AddressAutocomplete.css';

interface AddressAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	onSelect: (address: AddressSuggestion) => void;
	placeholder?: string;
	className?: string;
}

export interface AddressSuggestion {
	formatted: string;
	street: string;
	city: string;
	state: string;
	zip: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
	value,
	onChange,
	onSelect,
	placeholder = 'Start typing your address...',
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch suggestions from our server proxy
	const fetchSuggestions = useCallback(async (input: string) => {
		if (input.length < 3) {
			setSuggestions([]);
			setIsOpen(false);
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(
				`${
					process.env.REACT_APP_API_URL
				}/api/places/autocomplete?input=${encodeURIComponent(input)}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch suggestions');
			}

			const data = await response.json();

			if (data.predictions && data.predictions.length > 0) {
				setSuggestions(data.predictions);
				setIsOpen(true);
			} else {
				setSuggestions([]);
				setIsOpen(false);
			}
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			setSuggestions([]);
			setIsOpen(false);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Debounce the fetch function
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchSuggestions(value);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [value, fetchSuggestions]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Parse address components from place details
	const parseAddressComponents = (place: any): AddressSuggestion => {
		let street = '';
		let streetNumber = '';
		let route = '';
		let city = '';
		let state = '';
		let zip = '';

		place.address_components?.forEach((component: any) => {
			const types = component.types;

			if (types.includes('street_number')) {
				streetNumber = component.long_name;
			} else if (types.includes('route')) {
				route = component.long_name;
			} else if (types.includes('locality')) {
				city = component.long_name;
			} else if (types.includes('administrative_area_level_1')) {
				state = component.short_name;
			} else if (types.includes('postal_code')) {
				zip = component.long_name;
			}
		});

		street =
			streetNumber && route
				? `${streetNumber} ${route}`
				: route || streetNumber;

		return {
			formatted: place.formatted_address || '',
			street,
			city,
			state,
			zip,
		};
	};

	// Handle selection of a suggestion
	const handleSelect = async (prediction: any) => {
		try {
			const response = await fetch(
				`${
					process.env.REACT_APP_API_URL
				}/api/places/details?placeId=${encodeURIComponent(
					prediction.place_id
				)}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch place details');
			}

			const data = await response.json();

			if (data.result) {
				const parsedAddress = parseAddressComponents(data.result);
				onChange(parsedAddress.street); // Set the street address in the input
				onSelect(parsedAddress); // Pass all components to parent
				setIsOpen(false);
			}
		} catch (error) {
			console.error('Error fetching place details:', error);
		}
	};

	return (
		<div className='address-autocomplete' ref={wrapperRef}>
			<input
				ref={inputRef}
				type='text'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`form-input ${className}`}
			/>
			{isOpen && suggestions.length > 0 && (
				<div className='address-suggestions'>
					{isLoading ? (
						<div className='suggestion-item'>
							<div className='suggestion-text'>Loading...</div>
						</div>
					) : (
						<>
							{suggestions.map((suggestion) => (
								<div
									key={suggestion.place_id}
									className='suggestion-item'
									onClick={() => handleSelect(suggestion)}>
									<div className='suggestion-text'>
										{suggestion.description}
									</div>
								</div>
							))}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default AddressAutocomplete;
