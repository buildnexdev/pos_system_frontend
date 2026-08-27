import React from 'react';
import Icon from './icon/Icon';
import './AutoProgressBar.scss';

const AutoProgressBar = (parent: any) => {
	const { currentStage, stepNames, onStageValueChange } = parent;

	// Define icons for each step type
	const getStepIcon = (stepName: string) => {
		const name = stepName.toLowerCase();
		if (name.includes('basic') || name.includes('information')) return 'Person';
		if (name.includes('address')) return 'LocationOn';
		if (name.includes('business')) return 'Business';
		if (name.includes('vehicle')) return 'DirectionsCar';
		if (name.includes('bank')) return 'AccountBalance';
		if (name.includes('loan') || name.includes('index')) return 'Assignment';
		return 'Circle';
	};

	return (
		<div className='vertical-progress-container'>
			{stepNames.map((name: any, index: any) => (
				<div key={index} className='progress-step-item'>
					<div className='step-content'>
						<div 
							className={`step-icon-container ${index < currentStage ? 'active' : ''}`}
							onClick={() => onStageValueChange(index + 1)}
						>
							<Icon 
								icon={getStepIcon(name)} 
								size='lg'
								className={`step-icon ${index < currentStage ? 'active' : ''}`}
							/>
						</div>
						<div className='step-label'>
							{name}
						</div>
					</div>
					{index < stepNames.length - 1 && (
						<div className={`step-connector ${index < currentStage - 1 ? 'active' : ''}`} />
					)}
				</div>
			))}
		</div>
	);
};

export default AutoProgressBar;
