// HousePhotoMetaOverlay
// ---------------------------------------------------------------------------
// Tiny inline metadata footer rendered next to a member's house photo.
// Shows the per-image capture timestamp + GPS coordinates (with a tiny
// 120x120 Leaflet preview map if lat/lng is present), and a "View on map"
// link that opens HousePhotoMapModal.
//
// Falls back gracefully for legacy photos: if a per-image value is null,
// uses the whole-row rollup (HouseImageCapturedOn / HouseLatitude /
// HouseLongitude) from MemberApprove. If both are missing, shows
// "Location: not captured".
//
// Author : Santhosh
// Added  : 2026-06-30  (per-image GPS feature)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-require-imports */

import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HousePhotoMapModal, { HousePhotoMapEntry } from './HousePhotoMapModal';

// Fix Leaflet default-icon URLs (idempotent — also done by HousePhotoMapModal).
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const toNum = (v: unknown): number | null => {
	if (v === null || v === undefined || v === '') return null;
	const n = typeof v === 'number' ? v : parseFloat(String(v));
	return isNaN(n) ? null : n;
};

const fmtCapturedAt = (raw: unknown): string => {
	if (!raw) return '';
	const s = String(raw);
	// Backend already pre-formats HouseImageCapturedOn as "12-03-2026 04:32 PM".
	// New per-image ISO timestamps need a JS parse + locale format.
	if (/^\d{2}-\d{2}-\d{4}/.test(s)) return s;
	const d = new Date(s);
	if (isNaN(d.getTime())) return s;
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

interface HousePhotoMetaOverlayProps {
	/** image slot 1..5 — used to title the modal */
	slot: number;
	/** image URL (already including S3_API_URL prefix), or '' if none */
	imageUrl?: string;
	/** per-image fields (preferred) */
	lat?: number | string | null;
	lng?: number | string | null;
	capturedAt?: string | null;
	/** whole-member rollup fallbacks (from MemberApprove) */
	fallbackLat?: number | string | null;
	fallbackLng?: number | string | null;
	fallbackCapturedAt?: string | null;
	/** optional: full per-member photo list for the bigger map modal */
	allPhotosForMap?: HousePhotoMapEntry[];
	/** member name shown in the modal header */
	memberName?: string;
	/** show the 120x120 inline preview map (default true) */
	showInlineMap?: boolean;
}

const HousePhotoMetaOverlay: React.FC<HousePhotoMetaOverlayProps> = ({
	slot,
	imageUrl = '',
	lat,
	lng,
	capturedAt,
	fallbackLat,
	fallbackLng,
	fallbackCapturedAt,
	allPhotosForMap,
	memberName,
	showInlineMap = true,
}) => {
	const [mapOpen, setMapOpen] = useState(false);

	const effectiveLat = useMemo(() => toNum(lat) ?? toNum(fallbackLat), [lat, fallbackLat]);
	const effectiveLng = useMemo(() => toNum(lng) ?? toNum(fallbackLng), [lng, fallbackLng]);
	const effectiveCapturedAt = useMemo(
		() => capturedAt || fallbackCapturedAt || '',
		[capturedAt, fallbackCapturedAt],
	);

	const hasGps = effectiveLat !== null && effectiveLng !== null;
	const capturedAtLabel = fmtCapturedAt(effectiveCapturedAt);

	// If neither per-image nor rollup metadata is available, render nothing
	// (legacy photo) — but we still want to show "Location: not captured" once.
	if (!hasGps && !capturedAtLabel) {
		return (
			<div className='text-muted small mt-1'>
				<i>Location: not captured</i>
			</div>
		);
	}

	const photosForMap: HousePhotoMapEntry[] =
		allPhotosForMap && allPhotosForMap.length > 0
			? allPhotosForMap
			: [
					{
						slot,
						imageUrl,
						lat: effectiveLat,
						lng: effectiveLng,
						capturedAt: effectiveCapturedAt || null,
					},
			  ];

	return (
		<div className='mt-1' style={{ fontSize: '12px', lineHeight: 1.3 }}>
			{capturedAtLabel ? (
				<div className='text-muted'>
					<b>Captured:</b> {capturedAtLabel}
				</div>
			) : null}
			{hasGps ? (
				<>
					<div className='text-muted'>
						<b>Location:</b> {fmtCoord(effectiveLat as number, effectiveLng as number)}
					</div>
					{showInlineMap ? (
						<div
							className='mt-1'
							style={{
								width: 120,
								height: 120,
								borderRadius: 4,
								overflow: 'hidden',
								border: '1px solid #dee2e6',
							}}>
							<MapContainer
								center={[effectiveLat as number, effectiveLng as number]}
								zoom={15}
								zoomControl={false}
								scrollWheelZoom={false}
								dragging={false}
								doubleClickZoom={false}
								touchZoom={false}
								boxZoom={false}
								keyboard={false}
								attributionControl={false}
								style={{ height: '100%', width: '100%' }}>
								<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
								<Marker
									position={[
										effectiveLat as number,
										effectiveLng as number,
									]}
								/>
							</MapContainer>
						</div>
					) : null}
					<button
						type='button'
						className='btn btn-link p-0 small'
						style={{ fontSize: '11px' }}
						onClick={() => setMapOpen(true)}>
						View on map
					</button>
				</>
			) : (
				<div className='text-muted'>
					<i>Location: not captured</i>
				</div>
			)}

			<HousePhotoMapModal
				isOpen={mapOpen}
				setIsOpen={setMapOpen}
				photos={photosForMap}
				memberName={memberName}
			/>
		</div>
	);
};

export default HousePhotoMetaOverlay;
