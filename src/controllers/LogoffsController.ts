import * as Express from 'express';
import ContactService from '../services/ContactService';
import moment from 'moment';
import PdfService from '../services/PdfService';
import Logoff, { LogoffState } from '../entities/Logoff';
import { getManager } from 'typeorm';
import Contact from '../entities/Contact';
import Xlsx from 'xlsx';
import LogoffService from '../services/LogoffService';

interface GermanizedMember {
	Rang: string;
	Funktionen: string;
	Nachname: string;
	Vorname: string;
	Abholpunkt: string;
	AbholpunktAdresse: string;
	Adresse: string;
}

export default class LogoffsController {
	public static async getExcelExport(req: Express.Request, res: Express.Response): Promise<void> {
		const { from, until, state } = req.query as {
			from: string;
			until: string;
			state: LogoffState | string;
		};
		if (!from) {
			res.status(400).send('Missing parameter from');
		}
		if (!until) {
			res.status(400).send('Missing parameter until');
		}
		if (!state) {
			res.status(400).send('Missing parameter state');
		}
		if (!moment(from).isValid()) {
			res.status(400).send('Invalid date in from parameter');
		}
		if (!moment(until).isValid()) {
			res.status(400).send('Invalid date in until parameter');
		}
		if (!Object.values(LogoffState).includes(state as LogoffState) && state !== 'all') {
			res.status(400).send('Invalid state parameter');
		}

		const members = (await ContactService.getActiveMembers()).filter(
			(m) =>
				(!m.functions?.includes('FHR') && !m.functions?.includes('VST')) || m.functions.length > 1
		);
		const logoffs = await LogoffService.getLogoffs(
			from,
			until,
			state !== 'all' ? (state as LogoffState) : undefined
		);

		const logoffDates: string[] = [];
		const fromDate = moment(new Date(from));
		const untilDate = moment(new Date(until));
		let currentDate = fromDate.clone();
		while (currentDate <= untilDate) {
			logoffDates.push(currentDate.format('DD.MM.YYYY'));
			currentDate.add(1, 'day');
		}

		const exportArray = [];
		for (const member of members) {
			const memberLogoffs = logoffs.filter((l) => l.contact.id === member.id);
			let germanizedMember: GermanizedMember & { [index: string]: string } = {
				Rang: member.rank || '',
				Funktionen: (member.functions || []).join(','),
				Nachname: member.lastname,
				Vorname: member.firstname,
				Abholpunkt: member.extension?.collectionPoint?.name || '',
				AbholpunktAdresse: `${member.extension?.collectionPoint?.address}, ${member.extension?.collectionPoint?.postcode} ${member.extension?.collectionPoint?.city}`,
				Adresse: `${member.address}, ${member.postcode} ${member.city}`,
			};

			logoffDates.forEach((d) => {
				germanizedMember[d] = '';
			});

			memberLogoffs.forEach((l) => {
				let currentDate = moment(new Date(l.from.getTime()));
				let dates: moment.Moment[] = [];
				const untilMoment = moment(l.until);
				while (currentDate <= untilMoment) {
					if (logoffDates.indexOf(currentDate.format('DD.MM.YYYY')) > -1) {
						dates.push(currentDate.clone());
					}
					currentDate.add(1, 'day');
					currentDate.set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
				}

				if (l.until.getHours() > 0 || l.until.getMinutes() > 0) {
					dates.push(untilMoment);
				}

				dates.forEach((d) => {
					if (d.get('hours') > 0 || d.get('minutes') > 0) {
						if (germanizedMember[d.format('DD.MM.YYYY')]) {
							germanizedMember[d.format('DD.MM.YYYY')] = `${
								germanizedMember[d.format('DD.MM.YYYY')]
							} - ${d.format('HH:mm')}`;
						} else {
							germanizedMember[d.format('DD.MM.YYYY')] = d.format('HH:mm');
						}
					} else {
						germanizedMember[d.format('DD.MM.YYYY')] = 'x';
					}
				});
			});

			exportArray.push(germanizedMember);
		}

		let sheet = Xlsx.utils.json_to_sheet(exportArray);
		let book = Xlsx.utils.book_new();
		Xlsx.utils.book_append_sheet(book, sheet, `Abmeldungen`);

		res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader(
			'Content-Disposition',
			`inline; filename=Abmeldungen ${fromDate.format('DD-MM-YYYY')} - ${untilDate.format(
				'DD-MM-YYYY'
			)}.xlsx`
		);
		res.send(Xlsx.write(book, { type: 'buffer' }));
	}
}
