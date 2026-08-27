import React from 'react';
import './ProgressBar.scss';

const ProgressBar = (parent: any) => {
	const { currentStage, stepNames, onStageValueChange } = parent;

	return (
		<div className='d-flex flex-row justify-content-center position-relative myContainer'>
			{stepNames.map((name: any, index: any) => (
				<>
					<div className={`myline ${index < currentStage ? 'filled' : 'not-filled'}`} />
					<div>
						<div className='d-flex flex-row justify-content-center'>
							<p className='position-absolute bottom-60 progressBarLabel text-dark fw-bold fs-5'>
								{name}
							</p>
						</div>

						<div
							className={`myCircle ${index < currentStage ? 'filled' : 'not-filled'}`}
							onClick={() => onStageValueChange(index + 1)}>
							{index + 1}
						</div>
					</div>
					<div className={`myline ${index < currentStage ? 'filled' : 'not-filled'}`} />
				</>
			))}
		</div>
	);
};

export default ProgressBar;
