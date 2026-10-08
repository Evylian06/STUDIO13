import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Studio13_negro.png';


const secciones = [
	{ label: 'Inicio', icon: 'home', active: true },
	{ label: 'Clientes', icon: 'users' },
	{ label: 'Reservaciones', icon: 'calendar' },
	{ label: 'Paquetes', icon: 'layers' },
	{ label: 'Membresías', icon: 'membership' },
	{ label: 'Servicios', icon: 'camera' },
	{ label: 'Galería', icon: 'image' },
];

const trazosIcono = {
	home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
	users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
	calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
	layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
	membership: <><circle cx="12" cy="8" r="6" /><path d="m8.2 13-1 8 4.8-2.7 4.8 2.7-1-8" /></>,
	camera: <><path d="M14 4h-4l-2 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-2-3Z" /><circle cx="12" cy="13" r="3.5" /></>,
	image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
	logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
	menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
	arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
	refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
};

function Icono({ name, size = 20 }) {
	return (
		<svg
			aria-hidden="true"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{trazosIcono[name]}
		</svg>
	);
}
