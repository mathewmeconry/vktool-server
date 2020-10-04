import { promises as fs } from 'fs';
import path from 'path';
import { GeneratePdfOptions, generatePdf } from 'tea-school';
import moment from 'moment';
import * as pug from 'pug';
import Payout from '../entities/Payout';
import Contact from '../entities/Contact';
import CustomCompensation from '../entities/CustomCompensation';
import OrderCompensation from '../entities/OrderCompensation';
import { Options as SassOptions } from 'node-sass';
import { PDFOptions } from 'puppeteer';
import MaterialChangelog from '../entities/MaterialChangelog';

export default class PdfService {
	public static async generateMemberPayout(
		payout: Payout,
		member: Contact,
		compensations: Array<CustomCompensation | OrderCompensation>,
		compensationTotal: number
	): Promise<Buffer> {
		const logo = await fs.readFile(path.resolve(__dirname, '../../public/logo.png'));
		return PdfService.generatePdf(
			'memberPayout.pug',
			{
				file: path.resolve(__dirname, '../../public/pdfs/scss/memberPayout.scss'),
			},
			{
				location: 'Wallisellen',
				date: moment(new Date()).format('DD.MM.YYYY'),
				from: payout.from > new Date('1970-01-01') ? moment(payout.from).format('DD.MM.YYYY') : '',
				until: moment(payout.until).format('DD.MM.YYYY'),
				total: compensationTotal,
				member,
				compensations,
			},
			{
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'),
					{ logo: `data:image/png;base64,${logo.toString('base64')}` }
				),
				footerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug'),
					{ width: '125mm' }
				),
				format: 'A4',
				margin: {
					top: '25mm',
					left: '0',
					bottom: '25mm',
					right: '0',
				},
			}
		);
	}

	public static async generateMemberList(members: Contact[]): Promise<Buffer> {
		const logo = await fs.readFile(path.resolve(__dirname, '../../public/logo.png'));
		return PdfService.generatePdf(
			'memberList.pug',
			{
				file: path.resolve(__dirname, '../../public/pdfs/scss/memberList.scss'),
			},
			{
				date: moment(new Date()).format('DD.MM.YYYY'),
				members,
			},
			{
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'),
					{ logo: `data:image/png;base64,${logo.toString('base64')}` }
				),
				footerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug'),
					{ width: '190mm' }
				),
				format: 'A4',
				landscape: true,
				margin: {
					top: '25mm',
					left: '0',
					bottom: '25mm',
					right: '0',
				},
			}
		);
	}

	public static async generatePayoutOverview(
		payout: Payout,
		members: Array<Contact & { amount: number }>
	): Promise<Buffer> {
		const logo = await fs.readFile(path.resolve(__dirname, '../../public/logo.png'));
		return PdfService.generatePdf(
			'payoutOverview.pug',
			{
				file: path.resolve(__dirname, '../../public/pdfs/scss/payoutOverview.scss'),
			},
			{
				location: 'Wallisellen',
				date: moment(new Date()).format('DD.MM.YYYY'),
				from: payout.from > new Date('1970-01-01') ? moment(payout.from).format('DD.MM.YYYY') : '',
				until: moment(payout.until).format('DD.MM.YYYY'),
				presidentName: 'Reto Bernasconi',
				cashierName: 'Corinne Altherr',
				members,
			},
			{
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'),
					{ logo: `data:image/png;base64,${logo.toString('base64')}` }
				),
				footerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug'),
					{ width: '125mm' }
				),
				format: 'A4',
				margin: {
					top: '25mm',
					left: '0',
					bottom: '25mm',
					right: '0',
				},
			}
		);
	}

	public static async generateMaterialChangelogReceipe(
		changelog: MaterialChangelog
	): Promise<Buffer> {
		const logo = await fs.readFile(path.resolve(__dirname, '../../public/logo.png'));
		return PdfService.generatePdf(
			'materialChangelogReceipt.pug',
			{
				file: path.resolve(__dirname, '../../public/pdfs/scss/materialChangelogReceipt.scss'),
			},
			{
				location: 'Wallisellen',
				date: moment(changelog.createdAt).format('DD.MM.YYYY'),
				changelog,
				contact: changelog.inContact || changelog.outContact
			},
			{
				printBackground: true,
				displayHeaderFooter: true,
				headerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/header.pug'),
					{ logo: `data:image/png;base64,${logo.toString('base64')}` }
				),
				footerTemplate: pug.renderFile(
					path.resolve(__dirname, '../../public/pdfs/pugs/footer.pug'),
					{ width: '125mm' }
				),
				format: 'A4',
				margin: {
					top: '25mm',
					left: '0',
					bottom: '25mm',
					right: '0',
				},
			}
		);
	}

	private static async generatePdf(
		htmlTemplate: string,
		styleOptions?: SassOptions,
		htmlTemplateOptions?: pug.Options & pug.LocalsObject,
		pdfOptions?: PDFOptions
	): Promise<Buffer> {
		const options: GeneratePdfOptions = {
			htmlTemplatePath: path.resolve(__dirname, '../../public/pdfs/pugs/', htmlTemplate),
			styleOptions,
			htmlTemplateOptions,
			pdfOptions,
			puppeteerOptions: {
				userDataDir: '/tmp',
				headless: true,
				args: ['--disable-dev-shm-usage', '--no-sandbox'],
			},
		};

		return generatePdf(options);
	}
}
