import { MigrationInterface, QueryRunner, getConnection } from "typeorm";
import CustomCompensation from "../entities/CustomCompensation";
import fs from 'fs'
import Contact from "../entities/Contact";
import User from "../entities/User";

export class ImportCompensations1552926539441 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        let manager = queryRunner.manager
        let user = await manager.findOneOrFail(User, { where: { 'displayName': 'Mathias Scherer' } })

        let data = fs.readFileSync('src/migrations/compensations_20190318.json')
        let parsed = JSON.parse(data.toString())
        for (let record of parsed.data) {
            try {
                let contact = await manager.findOneOrFail(Contact, { bexioId: record.bexioID })
                if (!contact) throw new Error('Contact not found')

                //@ts-ignore
                let rec = new CustomCompensation(contact, user, parseFloat(record.total), new Date(record.datum), this.genDescription(record.bemerkung, record.von, record.bis), true)
                manager.save(CustomCompensation, rec)
            } catch (err) {
                console.log(`failed with ID ${record.bexioID}`)
                console.log(err)
            }
        }

        return
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        let manager = queryRunner.manager

        let data = fs.readFileSync('src/migrations/compensations_20190318.json')
        let parsed = JSON.parse(data.toString())
        for (let record of parsed.data) {
            let contact = await manager.findOneOrFail(Contact, { bexioId: record.bexioID })

            getConnection()
                .createQueryBuilder()
                .delete()
                .from(CustomCompensation)
                .where('memberId = :contact', { contact: contact.id })
                .andWhere('amount = :amount', { amount: parseFloat(record.total) })
                .andWhere('date = :date', { date: record.datum })
                .andWhere('description = :desc', { desc: this.genDescription(record.bemerkung, record.von, record.bis) })
                .execute()
        }

        return
    }

    private genDescription(bemerkung: string, von?: Date, bis?: Date): string {

        if (von && bis) {
            let v = new Date(von)
            let b = new Date(bis)
            //@ts-ignore
            return `${bemerkung} (${v.getHours().toString().padStart(2, '0')}:${v.getMinutes().toString().padStart(2, '0')} - ${b.getHours().toString().padStart(2, '0')}:${b.getMinutes().toString().padStart(2, '0')})`
        }

        return bemerkung
    }
}
