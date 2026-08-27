import React from 'react';
interface CommonTableVerifyProps {
	col1?: React.ReactNode;
	col2?: React.ReactNode;
	col3?: React.ReactNode;
	col4?: React.ReactNode;
	col5?: React.ReactNode;
	col6?: React.ReactNode;
	col7?: React.ReactNode;
	col8?: React.ReactNode;
	col9?: React.ReactNode;
	col10?: React.ReactNode;
	col11?: React.ReactNode;
	col12?: React.ReactNode;
	col13?: React.ReactNode;
	col14?: React.ReactNode;
	col15?: React.ReactNode;
	col16?: React.ReactNode;
	col17?: React.ReactNode;
	col18?: React.ReactNode;
	col19?: React.ReactNode;
	col20?: React.ReactNode;
	col21?: React.ReactNode;
	col22?: React.ReactNode;
	isLastAction1?: React.ReactNode;
	isLastAction3?: React.ReactNode;
	isLastAction4?: React.ReactNode;
	isLastAction5?: React.ReactNode;
	isLastAction6?: React.ReactNode;
	isLastAction7?: React.ReactNode;
}
const CommonTableVerify: React.FC<CommonTableVerifyProps> = ({
	col1,
	col2,
	col3,
	col4,
	col5,
	col6,
	col7,
	col8,
	col9,
	col10,
	col11,
	col12,
	col13,
	col14,
	col15,
	col16,
	col17,
	col18,
	col19,
	col20,
	col21,
	col22,
	isLastAction1,
	isLastAction3,
	isLastAction4,
	isLastAction5,
	isLastAction6,
	isLastAction7,
}) => {
	return (
		<tr>
			{col1 != null ? (
				<td>
					<div>{col1}</div>
				</td>
			) : (
				''
			)}
			{isLastAction1 != null ? <td>{isLastAction1}</td> : ''}
			{col2 != null ? (
				<td>
					<div>{col2}</div>
				</td>
			) : (
				''
			)}

			{col3 != null ? (
				<td>
					<div>{col3}</div>
				</td>
			) : (
				''
			)}

			{col4 != null ? (
				<td>
					<div>{col4}</div>
				</td>
			) : (
				''
			)}

			{col5 != null ? (
				<td>
					<div>{col5}</div>
				</td>
			) : (
				''
			)}
			{isLastAction3 != null ? <td>{isLastAction3}</td> : ''}
			{col6 != null ? (
				<td>
					<div>{col6}</div>
				</td>
			) : (
				''
			)}

			{col7 != null ? (
				<td>
					<div>{col7}</div>
				</td>
			) : (
				''
			)}

			{col8 != null ? (
				<td>
					<div>{col8}</div>
				</td>
			) : (
				''
			)}

			{col9 != null ? (
				<td>
					<div>{col9}</div>
				</td>
			) : (
				''
			)}

			{col10 != null ? (
				<td>
					<div>{col10}</div>
				</td>
			) : (
				''
			)}

			{col11 != null ? (
				<td>
					<div>{col11}</div>
				</td>
			) : (
				''
			)}

			{col12 != null ? (
				<td>
					<div>{col12}</div>
				</td>
			) : (
				''
			)}
			{col13 != null ? (
				<td>
					<div>{col13}</div>
				</td>
			) : (
				''
			)}
			{col14 != null ? (
				<td>
					<div>{col14}</div>
				</td>
			) : (
				''
			)}
			{col15 != null ? (
				<td>
					<div>{col15}</div>
				</td>
			) : (
				''
			)}
			{col16 != null ? (
				<td>
					<div>{col16}</div>
				</td>
			) : (
				''
			)}
			{col17 != null ? (
				<td>
					<div>{col17}</div>
				</td>
			) : (
				''
			)}
			{isLastAction4 != null ? <td>{isLastAction4}</td> : ''}
			{col18 != null ? (
				<td>
					<div>{col18}</div>
				</td>
			) : (
				''
			)}
			{col19 != null ? (
				<td>
					<div>{col19}</div>
				</td>
			) : (
				''
			)}
			{col20 != null ? (
				<td>
					<div>{col20}</div>
				</td>
			) : (
				''
			)}
			{isLastAction5 != null ? <td>{isLastAction5}</td> : ''}
			{col21 != null ? (
				<td>
					<div>{col21}</div>
				</td>
			) : (
				''
			)}
			{col22 != null ? (
				<td>
					<div>{col22}</div>
				</td>
			) : (
				''
			)}
			{isLastAction6 != null ? <td>{isLastAction6}</td> : ''}
			{isLastAction7 != null ? <td>{isLastAction7}</td> : ''}
		</tr>
	);
};

export default CommonTableVerify;
