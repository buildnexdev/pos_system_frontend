import React from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import useDarkMode from '../../../hooks/useDarkMode';
import Footer from '../../../layout/Footer/Footer';

const DefaultFooter = () => {
	const { darkModeStatus } = useDarkMode();

	return (
		<Footer>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col footFontSize'>
						<span className='fw-light'>Copyright © 2026 - Version 1.0.0</span>
					</div>
					{/* <div className='col'>
						<span className='fw-light'>Page version 1.0.1</span>
					</div> */}
					<div className='col-auto footFontSize d-flex align-items-center gap-1'>
						<motion.span
							aria-hidden
							className='text-danger d-inline-flex'
							style={{ fontSize: '0.8rem', lineHeight: 1 }}
							animate={{ scale: [1, 1.32, 0.96, 1.08, 1] }}
							transition={{
								duration: 1.15,
								repeat: Infinity,
								repeatDelay: 0.4,
								ease: 'easeInOut',
							}}>
							♥
						</motion.span>
						<a
							href='/'
							className={classNames('text-decoration-none', {
								'link-dark': !darkModeStatus,
								'link-light': darkModeStatus,
							})}>
							<small className='fw-bold'>DS Nidhi Fund</small>
						</a>
					</div>
				</div>
			</div>
		</Footer>
	);
};

export default DefaultFooter;
