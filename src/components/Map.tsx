/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/prop-types */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { S3_API_URL } from '../redux/const';

const MapComponent = ({ ...props }) => {
	const {
		CollectionData,
		BranchData,
		updateBranchData,
		getStaffDetails,
		CollectionNotes,
		CollectionNotesCenter,
		CenterRegion = [11.1271, 78.6569],
		isPinNeeded = false,
		LocationData,
		searcVal,
	} = props;
	const [draggable, setDraggable] = useState(false);
	const [address, setAddress] = useState(null);
	const [markerPosition, setMarkerPosition] = useState<{ lat: any; lng: any } | null>(null);
	const [searchQuery, setSearchQuery] = useState(searcVal !== undefined ? searcVal : '');

	const branchArr = BranchData;
	const locationArr = LocationData;
	const markerRef = useRef(null);
	const mapRef = useRef<any>(null);

	useEffect(() => {
		if (locationArr !== null && locationArr !== undefined && locationArr.length > 0) {
			const { BranchLatitude, BranchLongitude } = locationArr[0];
			const latitude = parseFloat(BranchLatitude);
			const longitude = parseFloat(BranchLongitude);
			if (
				!isNaN(latitude) &&
				latitude !== null &&
				longitude !== null &&
				!isNaN(longitude) &&
				longitude !== undefined
			) {
				setMarkerPosition({ lat: latitude, lng: longitude });
			}
		}
	}, [LocationData]);

	// const eventHandlers = useMemo(
	// 	() => ({
	// 		dragend() {
	// 			const marker = markerRef.current;
	// 			if (marker != null) {
	// 				if (branchArr !== null && branchArr.length > 0) {
	// 					branchArr[0].BranchLatitude = marker._latlng.lat;
	// 					branchArr[0].BranchLongitude = marker._latlng.lng;
	// 					updateBranchData(branchArr);
	// 				} else {
	// 					updateBranchData([
	// 						{
	// 							BranchLatitude: marker._latlng.lat,
	// 							BranchLongitude: marker._latlng.lng,
	// 						},
	// 					]);
	// 					branchArr.push({
	// 						AreaID: 1,
	// 						BranchLatitude: marker._latlng.lat,
	// 						BranchLongitude: marker._latlng.lng,
	// 						AreaName: 'New Branch',
	// 					});
	// 				}
	// 			}
	// 		},
	// 	}),
	// 	[],
	// );

	// const handleMapClick = (e: any) => {
	// 	const { lat, lng } = e.latlng;
	// 	setMarkerPosition({ lat, lng });
	// 	locationArr[0].BranchLatitude = lat;
	// 	locationArr[0].BranchLongitude = lng;
	// 	updateBranchData(locationArr);
	// 	fetchAddress(lat, lng);
	// };

	// Handle Map Click Function
	const handleMapClick = (e: any) => {
		const { lat, lng } = e.latlng;
		setMarkerPosition({ lat, lng });
		// Create new location data if array is empty
		if (!locationArr || locationArr.length === 0) {
			const newLocation = {
				BranchLatitude: lat,
				BranchLongitude: lng,
			};
			updateBranchData([newLocation]);
		} else {
			// Update existing location data
			const updatedLocation = [...locationArr];
			updatedLocation[0].BranchLatitude = lat;
			updatedLocation[0].BranchLongitude = lng;
			updateBranchData(updatedLocation);
		}
		fetchAddress(lat, lng);
	};

	// const toggleDraggable = useCallback(() => {
	// 	setDraggable((d) => !d);
	// }, []);

	// create custom icon
	const customIcon = L.icon({
		// iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
		iconUrl: require('../assets/img/marker_icon.png'),
		iconSize: [50, 50], // size of the icon
	});

	const customIcon1 = L.icon({
		// iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
		iconUrl: require('../assets/img/BluePin.png'),
		iconSize: [50, 50], // size of the icon
	});

	// Custom marker icon function
	const getUserMarkerIcon = (photoUrl: any) => {
		return L.icon({
			iconUrl: photoUrl, // UserPhoto URL
			iconSize: [40, 40], // Adjust size as needed
			iconAnchor: [20, 40], // Position of the icon anchor
			popupAnchor: [0, -40], // Position of the popup anchor
		});
	};

	const ClickHandler = ({ onMapClick }: any) => {
		useMapEvents({
			click: (e) => {
				onMapClick(e);
			},
		});
		return null;
	};

	const fetchAddress = async (lat: any, lng: any) => {
		try {
			if (lat && lng) {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
				);
				if (!response.ok) {
					throw new Error('Failed to fetch address');
				}
				const data = await response.json();
				if (data?.display_name) {
					setAddress(data?.display_name);
					
					// Update the parent component with the address
					if (locationArr && locationArr.length > 0) {
						const updatedLocation = [...locationArr];
						updatedLocation[0].AreaName = data.display_name;
						updateBranchData(updatedLocation);
					}
				}
			}
		} catch (error) {
			setAddress(null);
		}
	};

	const handleSearch = (e: any) => {
		try {
			e.preventDefault();
			const addr = e.target.elements.address.value;
			if (addr) {
				setSearchQuery(addr);
				fetch(`https://nominatim.openstreetmap.org/search?q=${addr}&format=json`)
					.then((response) => response.json())
					.then((data) => {
						if (data && data.length > 0) {
							const { lat, lon } = data[0];
							setMarkerPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
							
							// Create updated location data with address
							const updatedLocation = [...locationArr];
							updatedLocation[0].BranchLatitude = lat;
							updatedLocation[0].BranchLongitude = lon;
							
							// Include the address in the location data
							if (data[0]?.display_name) {
								updatedLocation[0].AreaName = data[0].display_name;
								setAddress(data[0].display_name);
							}
							
							updateBranchData(updatedLocation);
							if (mapRef?.current) {
								mapRef.current.setView([lat, lon], 10);
							}
						} else {
							// alert('Location not found');
						}
					})
					.catch((error) => {
						// console.error('Error fetching location:', error);
					});
			}
		} catch (error) {
			setAddress(null);
		}
	};

	// useEffect(() => {
	// 	if (CenterRegion) {
	// 		if (mapRef?.current) {
	// 			mapRef.current.setView(CenterRegion, 10);
	// 		}
	// 	}
	// }, [CenterRegion]);

	return (
		<div style={{ position: 'relative' }}>
			<MapContainer
				center={CenterRegion}
				zoom={8}
				minZoom={2}
				scrollWheelZoom
				style={{ height: '500px', width: '100%' }}
				ref={mapRef}>
				<TileLayer
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>

				{CollectionData &&
					CollectionData.map((user: any) => (
						<Marker
							key={user.UserID}
							position={[user.Latitude, user.Longitude]}
							icon={
								// customIcon
								user.UserPhoto !== ''
									? getUserMarkerIcon(`${S3_API_URL}${user.UserPhoto}`)
									: customIcon
							}>
							<Popup>
								<div style={{ fontSize: '16px' }}>
									<b>{user.UserName}</b>
									<br />
									<a href={`tel:${user.UserPhoneNum}`}>+91{user.UserPhoneNum}</a>
									<br />
									Total Amount to collect: Rs.{user.totalAmountToCollect}
									<br />
									Cash in hand: Rs.{user.collectedAmount}
									<br />
									Previous Advance: Rs.{user.PreAdvance}
									<br />
									Today Advance: Rs.{user.TodayAdvance}
									<br />
									Amount yet to collect: Rs.{user.OLB}
									<br />
									Address: {user.UserAddress}
									<br />
									<div
										data-toggle='modal'
										data-href='#viewOfficerModal'
										style={{
											cursor: 'pointer',
											textDecoration: 'underline',
											color: 'blue',
										}}
										onClick={() => getStaffDetails(user.UserID, 'INITIAL')}
										aria-hidden='true'
										className='getInfo'>
										View Info
									</div>
								</div>
							</Popup>
						</Marker>
					))}

				{CollectionNotes &&
					CollectionNotes.map((user: any, index: any) => (
						<Marker
							key={index}
							position={
								user?.CollectionLatitude
									? [user.CollectionLatitude, user.CollectionLongitude]
									: [user.Latitude, user.Longitude]
							}
							icon={customIcon}>
							<Popup>
								<div style={{ fontSize: '16px' }}>
									{user?.meetUpTime && <b>Meetup Time : {user.meetUpTime}</b>}
									{user?.CollectionTime && (
										<>
											<br />
											<b>Collected Time : {user.CollectionTime}</b>
										</>
									)}
									{user?.order && (
										<>
											<br />
											<b>Order : {user.order}</b>
										</>
									)}
									{user?.num_collections_same_latlong && (
										<>
											<br />
											<b>
												No. Of Collection :{' '}
												{user.num_collections_same_latlong}
											</b>
										</>
									)}
									{user?.RePayTimeUI && (
										<>
											<br />
											<b>Collected Time : {user.RePayTimeUI}</b>
										</>
									)}
									{user?.CenterName && (
										<>
											<br />
											<b>
												Center : {user.UniqueCenterID}-{user.CenterName}
											</b>
										</>
									)}
								</div>
							</Popup>
						</Marker>
					))}

				{CollectionNotesCenter &&
					CollectionNotesCenter[0].CenterLatitude != '' &&
					CollectionNotesCenter[0].CenterLatitude != null &&
					CollectionNotesCenter[0].CenterLatitude != 'undefined' &&
					CollectionNotesCenter[0].CenterLatitude != 'null' &&
					CollectionNotesCenter.map((user: any, index: any) => (
						<Marker
							key={index}
							position={[user.CenterLatitude, user.CenterLongitude]}
							icon={customIcon1}>
							<Popup>
								<div style={{ fontSize: '16px' }}>
									{user?.CenterName && (
										<b>
											Center : {user.UniqueCenterID}-{user.CenterName}
										</b>
									)}
									{user?.meetUpTime && (
										<>
											<br />
											<b>MeetUp Time : {user.meetUpTime}</b>
										</>
									)}
								</div>
							</Popup>
						</Marker>
					))}

				{isPinNeeded && markerPosition && (
					<Marker position={[markerPosition.lat, markerPosition.lng]} icon={customIcon}>
						{address && (
							<Popup>
								<div style={{ fontSize: '16px' }}>
									<b>{address}</b>
								</div>
							</Popup>
						)}
					</Marker>
				)}

				{branchArr &&
					branchArr.length > 0 &&
					branchArr.map((branch: any) => (
						<Marker
							// draggable={draggable}
							// eventHandlers={eventHandlers}
							// ref={markerRef}
							key={branch.AreaID}
							position={[branch.BranchLatitude, branch.BranchLongitude]}
							icon={customIcon1}>
							<Popup>
								<div style={{ fontSize: '16px' }}>
									<b>{branch.AreaName}</b>
								</div>
							</Popup>
						</Marker>
					))}
				{isPinNeeded && <ClickHandler onMapClick={(e: any) => handleMapClick(e)} />}
			</MapContainer>
			{isPinNeeded && (
				<div
					style={{
						position: 'absolute',
						top: '10px',
						right: '10px',
						backgroundColor: 'white',
						padding: '5px',
						zIndex: 1000,
					}}>
					<form onSubmit={handleSearch}>
						<input
							type='text'
							name='address'
							placeholder='Search...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{ width: '200px', height: '30px', margin: '5px' }}
						/>
						<button style={{ padding: '5px' }} type='submit'>
							Search
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default MapComponent;
