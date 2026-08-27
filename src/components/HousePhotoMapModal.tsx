// HousePhotoMapModal
// ---------------------------------------------------------------------------
// Shows ALL captured house photos (houseImage1..5) for a single member on a
// Leaflet map. Markers are placed at the per-image capture coordinates.
// Auto-fits bounds to include every GPS-tagged photo.
//
// Author : Santhosh
// Added  : 2026-06-30  (per-image GPS feature)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-require-imports */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import Modal, { ModalBody, ModalHeader, ModalTitle } from './bootstrap/Modal';
import Icon from './icon/Icon';
import Button from './bootstrap/Button';

// Fix default marker icon URLs (same pattern as MapModal.tsx / OficerMapModal.tsx).
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Purple "house" marker — matches OficerMapModal's 'HouseImage' marker style.
const houseIcon = (slot: number) =>
	L.divIcon({
		className: 'custom-marker-house-photo',
		html: `
			<div style="
				background-color: #800080;
				width: 32px;
				height: 32px;
				border-radius: 50%;
				border: 3px solid white;
				box-shadow: 0 4px 8px rgba(0,0,0,0.4);
				display: flex;
				justify-content: center;
				align-items: center;
				color: white;
				font-weight: bold;
				font-size: 13px;
			">${slot}</div>
		`,
		iconSize: [32, 32],
		iconAnchor: [16, 16],
		popupAnchor: [0, -16],
	});

// Auto-fit map to the bounds of all GPS-tagged photos.
const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
	const map = useMap();
	useEffect(() => {
		if (points.length === 0) return;
		if (points.length === 1) {
			map.setView(points[0], 16);
			return;
		}
		map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
	}, [points, map]);
	return null;
};

export interface HousePhotoMapEntry {
	slot: number;
	imageUrl: string;       // already includes S3_API_URL prefix (or '' if no upload)
	lat: number | null;
	lng: number | null;
	capturedAt: string | null;
}

interface HousePhotoMapModalProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	photos: HousePhotoMapEntry[];
	memberName?: string;
}

const fmtCapturedAt = (iso: string | null): string => {
	if (!iso) return 'Not captured';
	const d = new Date(iso);
	if (isNaN(d.getTime())) return iso;
	return d.toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
};

const fmtCoord = (lat: number, lng: number): string => {
	const ns = lat >= 0 ? 'N' : 'S';
	const ew = lng >= 0 ? 'E' : 'W';
	return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
};

const HousePhotoMapModal: React.FC<HousePhotoMapModalProps> = ({
	isOpen,
	setIsOpen,
	photos,
	memberName,
}) => {
	// Lightbox state for "open full image" from popup.
	const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
	const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
	const mapRef = useRef<L.Map | null>(null);

	const openLightbox = (src: string) => {
		setLightboxSrc(src);
		setLightboxOpen(true);
	};

	// Only photos with valid lat/lng are placeable on the map.
	const placed = useMemo(
		() =>
			photos.filter(
				(p): p is HousePhotoMapEntry & { lat: number; lng: number } =>
					typeof p.lat === 'number' &&
					typeof p.lng === 'number' &&
					!isNaN(p.lat) &&
					!isNaN(p.lng),
			),
		[photos],
	);

	const points = placed.map((p) => [p.lat, p.lng] as [number, number]);

	return (
		<>
			<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered size='lg'>
				<ModalHeader setIsOpen={setIsOpen}>
					<ModalTitle id='house-photos-on-map'>
						<Icon icon='LocationOn' className='me-2' />
						House Photos on Map
						{memberName ? <span className='ms-2 text-muted'>· {memberName}</span> : null}
						<span className='ms-2 badge bg-info'>
							{placed.length} GPS-tagged
						</span>
					</ModalTitle>
				</ModalHeader>
				<ModalBody>
					{placed.length === 0 ? (
						<div className='text-center py-5'>
							<Icon icon='LocationOff' size='3x' className='text-muted mb-2' />
							<p className='text-muted mb-0'>
								No GPS-tagged photos for this member yet.
							</p>
							<small className='text-muted'>
								Upload a new house photo with location access enabled to
								see it here.
							</small>
						</div>
					) : (
						<div
							style={{
								height: '500px',
								width: '100%',
								borderRadius: '8px',
								overflow: 'hidden',
								border: '1px solid #dee2e6',
							}}>
							<MapContainer
								center={points[0]}
								zoom={15}
								scrollWheelZoom
								style={{ height: '100%', width: '100%' }}
								ref={mapRef}>
								<TileLayer
									url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								/>
								<FitBounds points={points} />
								{placed.map((p) => (
									<Marker
										key={`house-photo-${p.slot}`}
										position={[p.lat, p.lng]}
										icon={houseIcon(p.slot)}>
										<Popup minWidth={180}>
											<div style={{ textAlign: 'center' }}>
												<div className='mb-2'>
													<b>House Image {p.slot}</b>
												</div>
												{p.imageUrl ? (
													<img
														src={p.imageUrl}
														alt={`House ${p.slot}`}
														style={{
															width: 80,
															height: 80,
															objectFit: 'cover',
															borderRadius: 4,
															cursor: 'pointer',
															border: '1px solid #ddd',
														}}
														onClick={() => openLightbox(p.imageUrl)}
													/>
												) : (
													<div className='text-muted small'>
														(no image)
													</div>
												)}
												<div className='mt-2 small text-muted'>
													Captured: {fmtCapturedAt(p.capturedAt)}
												</div>
												<div className='small text-muted'>
													{fmtCoord(p.lat, p.lng)}
												</div>
												{p.imageUrl ? (
													<Button
														color='link'
														size='sm'
														className='mt-1 p-0'
														onClick={() =>
															setLightboxSrc(p.imageUrl)
														}>
														Open full image
													</Button>
												) : null}
											</div>
										</Popup>
									</Marker>
								))}
							</MapContainer>
						</div>
					)}
				</ModalBody>
			</Modal>

			{/* Lightbox for full-size image preview */}
			<Modal
				isOpen={lightboxOpen}
				setIsOpen={setLightboxOpen}
				isCentered
				size='lg'>
				<ModalHeader setIsOpen={setLightboxOpen}>
					<ModalTitle id='house-photo-lightbox'>House Photo</ModalTitle>
				</ModalHeader>
				<ModalBody>
					{lightboxSrc ? (
						<img
							src={lightboxSrc}
							alt='House photo'
							style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
						/>
					) : null}
				</ModalBody>
			</Modal>
		</>
	);
};

export default HousePhotoMapModal;
