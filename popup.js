const btn = document.getElementById('btn');

btn.addEventListener('click', async () => {
	let [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});

	if (tab.url.includes('subwise_attendace_new.php')) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: erpScript,
		});
	}
});

const erpScript = () => {
	const table = document.querySelector('table');
	const allTr = table.querySelectorAll('tr');

	const rowsLessThatCriteria = [...allTr]
		.filter((tr) => {
			const lastElementText = tr.lastElementChild.textContent;
			tr.style.color = 'white';
			if (lastElementText >= 0 && lastElementText <= 65)
				tr.style.backgroundColor = '#F31559';
			else if (lastElementText > 65 && lastElementText < 75)
				tr.style.backgroundColor = '#75C2F6';
			else if (lastElementText >= 75) tr.style.backgroundColor = '#7A9D54';
			return lastElementText < 75;
		})
		.sort(
			(a, b) =>
				Number(a.lastElementChild.textContent) -
				Number(b.lastElementChild.textContent)
		);

	console.log(rowsLessThatCriteria);

	const cardHeader = document.querySelectorAll('.card-header')[1];
	cardHeader.classList.add('cardHeader');

	const showInfoDivBtn = document.createElement('button');
	showInfoDivBtn.textContent = 'Low Att Subs';
	showInfoDivBtn.classList.add('showInfoDivBtn');

	cardHeader.append(showInfoDivBtn);

	const infoDiv = document.createElement('div');
	infoDiv.classList.add('infoDiv');

	infoDiv.addEventListener('click', (e) => {
		e.stopPropagation();
	});

	showInfoDivBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		document.addEventListener('click', () => {
			if (infoDiv.classList.contains('show')) {
				infoDiv.classList.toggle('show');
			}
		});

		infoDiv.classList.toggle('show');

		if (calculatorDiv.classList.contains('show')) {
			calculatorDiv.classList.remove('show');
		}

		infoDiv.innerHTML = `<div class="info-row top">
            <span class="info-cell1 cell">Subject</span>
            <span class="info-cell2 cell">Att (%)</span>
        </div>`;
		rowsLessThatCriteria.forEach((row) => {
			const infoRow = document.createElement('div');
			const infoCell1 = document.createElement('span');
			const infoCell2 = document.createElement('span');

			infoRow.classList.add('info-row');
			infoCell1.classList.add('info-cell1', 'cell');
			infoCell2.classList.add('info-cell2', 'cell');

			infoCell1.textContent = row.children[1].textContent;
			infoCell2.textContent = row.lastElementChild.textContent;
			infoRow.append(infoCell1, infoCell2);
			infoDiv.append(infoRow);
		});
		cardHeader.append(infoDiv);
	});

	const showCalculatorBtn = document.createElement('button');
	showCalculatorBtn.classList.add('showCalculatorBtn');
	showCalculatorBtn.textContent = 'Att Calc';
	cardHeader.append(showCalculatorBtn);

	const calculatorDiv = document.createElement('div');
	calculatorDiv.classList.add('calculatorDiv');

	calculatorDiv.addEventListener('click', (e) => {
		e.stopPropagation();
	});

	showCalculatorBtn.addEventListener('click', (e) => {
		calculatorDiv.innerHTML = '';
		e.stopPropagation();

		document.addEventListener('click', () => {
			if (calculatorDiv.classList.contains('show')) {
				calculatorDiv.classList.toggle('show');
			}
		});

		if (infoDiv.classList.contains('show')) {
			infoDiv.classList.remove('show');
		}

		calculatorDiv.classList.toggle('show');

		const attendedLabel = document.createElement('label');
		attendedLabel.textContent = 'Attended';
		attendedLabel.setAttribute('for', 'attendedInput');

		const attendedInput = document.createElement('input');
		attendedInput.setAttribute('type', 'number');
		attendedInput.setAttribute('id', 'attendedInput');

		const deliveredLabel = document.createElement('label');
		deliveredLabel.textContent = 'Delivered';
		deliveredLabel.setAttribute('for', 'deliveredInput');

		const deliveredInput = document.createElement('input');
		deliveredInput.setAttribute('type', 'number');
		deliveredInput.setAttribute('id', 'deliveredInput');

		const toBeAttendedLabel = document.createElement('label');
		toBeAttendedLabel.textContent = 'To be Attended';
		toBeAttendedLabel.setAttribute('for', 'toBeAttendedInput');

		const toBeAttendedInput = document.createElement('input');
		toBeAttendedInput.setAttribute('type', 'number');
		toBeAttendedInput.setAttribute('id', 'toBeAttendedInput');

		const toBeDeliveredLabel = document.createElement('label');
		toBeDeliveredLabel.textContent = 'To be Delivered';
		toBeDeliveredLabel.setAttribute('for', 'toBeDeliveredInput');

		const toBeDeliveredInput = document.createElement('input');
		toBeDeliveredInput.setAttribute('type', 'number');
		toBeDeliveredInput.setAttribute('id', 'toBeDeliveredInput');

		const percentageTag = document.createElement('p');
		percentageTag.textContent = 'Percentage';

		const percentageDisp = document.createElement('p');

		const leftToAttendTag = document.createElement('p');
		leftToAttendTag.textContent = 'More to Attended';

		const leftToAttendDisp = document.createElement('p');

		[
			attendedInput,
			deliveredInput,
			toBeAttendedInput,
			toBeDeliveredInput,
		].forEach((element) => {
			element.addEventListener('change', () => {
				runCalcScript(
					attendedInput,
					deliveredInput,
					toBeAttendedInput,
					toBeDeliveredInput,
					percentageDisp,
					leftToAttendDisp
				);
			});
		});

		[
			attendedInput,
			deliveredInput,
			toBeAttendedInput,
			toBeDeliveredInput,
		].forEach((element) => {
			element.addEventListener('keyup', () => {
				runCalcScript(
					attendedInput,
					deliveredInput,
					toBeAttendedInput,
					toBeDeliveredInput,
					percentageDisp,
					leftToAttendDisp
				);
			});
		});

		calculatorDiv.append(
			attendedLabel,
			attendedInput,
			deliveredLabel,
			deliveredInput,
			toBeAttendedLabel,
			toBeAttendedInput,
			toBeDeliveredLabel,
			toBeDeliveredInput,
			percentageTag,
			percentageDisp,
			leftToAttendTag,
			leftToAttendDisp
		);

		cardHeader.append(calculatorDiv);
	});

	function runCalcScript(
		attendedInput,
		deliveredInput,
		toBeAttendedInput,
		toBeDeliveredInput,
		percentageDisp,
		leftToAttendDisp
	) {
		if (
			attendedInput.value.length > 0 &&
			deliveredInput.value.length > 0 &&
			toBeAttendedInput.value.length > 0 &&
			toBeDeliveredInput.value.length > 0
		) {
			let percentage =
				((Number(attendedInput.value) + Number(toBeAttendedInput.value)) /
					(Number(deliveredInput.value) + Number(toBeDeliveredInput.value))) *
				100;

			percentageDisp.textContent = percentage;

			let leftClasses = Math.ceil(
				0.75 *
					(Number(deliveredInput.value) + Number(toBeDeliveredInput.value)) -
					(Number(attendedInput.value) + Number(toBeAttendedInput.value))
			);

			if (percentage > 100 || percentage < 0) {
				leftToAttendDisp.textContent = 'Wrong Values Entered';
			} else {
				if (percentage >= 75 || percentage == 100) {
					leftToAttendDisp.textContent = 'Sufficient attendance';
				} else {
					leftToAttendDisp.textContent = leftClasses;
				}
			}
		} else if (
			attendedInput.value.length > 0 &&
			deliveredInput.value.length > 0
		) {
			let percentage =
				(Number(attendedInput.value) / Number(deliveredInput.value)) * 100;

			percentageDisp.textContent = percentage;

			if (percentage > 100 || percentage < 0) {
				leftToAttendDisp.textContent = 'Wrong Values Entered';
			} else {
				if (percentage >= 75 || percentage == 100) {
					leftToAttendDisp.textContent = 'Sufficient attendance';
				} else {
					leftToAttendDisp.textContent = leftClasses;
				}
			}
		}
	}
};
