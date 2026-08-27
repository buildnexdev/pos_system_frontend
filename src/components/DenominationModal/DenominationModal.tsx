/**
 * DenominationModal — shared money-note × count grid used by the collection
 * screens (Member / Advance / Arrear / Auto-loan / Business / Gold).
 *
 * ponytail: this component owns the reusable NOTE-GRID table only; each caller
 * keeps its own <Modal> wrapper + money-math handlers so no in-flight receipt /
 * cheque / loan-type / EOD guards are touched. Extract the whole modal wrapper
 * once the surrounding header context (dueNo / receipt / cheque / loan type
 * tabs) is normalised across callers.
 */
import React from 'react';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';

// The 9 supported denominations (INR notes) in the classic-modal order.
const NOTES: Array<{
	note: number;
	inputKey: string;
	totalKey: string;
}> = [
	{ note: 500, inputKey: 'inputDenominationFiveHundredValue', totalKey: 'fiveHundredValue' },
	{ note: 200, inputKey: 'inputDenominationTwoHundredValue', totalKey: 'twoHundredValue' },
	{ note: 100, inputKey: 'inputDenominationHundredValue', totalKey: 'hundredValue' },
	{ note: 50, inputKey: 'inputDenominationFiftyValue', totalKey: 'fiftyValue' },
	{ note: 20, inputKey: 'inputDenominationTwentyValue', totalKey: 'twentyValue' },
	{ note: 10, inputKey: 'inputDenominationTenValue', totalKey: 'tenValue' },
	{ note: 5, inputKey: 'inputDenominationFiveValue', totalKey: 'fiveValue' },
	{ note: 2, inputKey: 'inputDenominationTwoValue', totalKey: 'twoValue' },
	{ note: 1, inputKey: 'inputDenominationOneValue', totalKey: 'oneValue' },
];

export type DenominationValues = Record<string, string | number | undefined>;

export type DenominationModalProps = {
	/** Object holding the 9 `inputDenomination*Value` count fields + 9 total
	 * fields (`fiveHundredValue` etc). Each caller passes its own `localState`
	 * / `localCredential` / `formik.values` slice byte-identically to the
	 * classic inline JSX. */
	values: DenominationValues;
	/** Called when the count field for `note` changes. Signature matches the
	 * existing `onDenominationchange(value, note)` handler in every caller. */
	onChange: (value: string, note: number) => void;
	/** Currency prefix (₹ / `Rs.`), defaults to empty string. */
	currency?: string;
	/** Optional total line displayed under the table (matches the classic
	 * `Total Amount : ₹{paymentAmount}` label). Omit to hide. */
	totalLabel?: React.ReactNode;
	/** Casing of the total-value keys on `values`. `'lower'` reads
	 * `fiveHundredValue`, `'upper'` reads `FiveHundredValue` (advance /
	 * arrear pages use the capitalised style on `localCredential`). */
	totalKeyCase?: 'lower' | 'upper';
	/** Table wrapper className. Defaults to `table table-modern` — the
	 * classic inline JSX. Pass through per caller for variants like
	 * `table table-modern text-nowrap`. */
	tableClassName?: string;
};

const DenominationModal: React.FC<DenominationModalProps> = ({
	values,
	onChange,
	currency = '',
	totalLabel,
	totalKeyCase = 'lower',
	tableClassName = 'table table-modern',
}) => {
	const resolveTotalKey = (base: string) =>
		totalKeyCase === 'upper' ? base.charAt(0).toUpperCase() + base.slice(1) : base;
	return (
		<div className='row mt-3'>
			<div className='col-12'>
				<table className={tableClassName}>
					<thead>
						<tr>
							<th>Amount</th>
							<th> </th>
							<th className='spaceWidth'>Number of money</th>
							<th>Total Amount</th>
						</tr>
					</thead>
					<tbody>
						{NOTES.map(({ note, inputKey, totalKey }) => (
							<tr key={note}>
								<td className='alignCenter'>{note}</td>
								<td className='alignCenter'>X</td>
								<td>
									<FormGroup id={inputKey} isFloating>
										<Input
											placeholder=''
											onChange={(e: any) => onChange(e.target.value, note)}
											value={values[inputKey] as any}
										/>
									</FormGroup>
								</td>
								<td className='alignCenter'>
									{currency}
									{values[resolveTotalKey(totalKey)] as any}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{totalLabel != null ? (
					<div className='row alignRight'>
						<div className='col-12 alignCenter'>
							<b>{totalLabel}</b>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default DenominationModal;
