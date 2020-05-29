import {MigrationInterface, QueryRunner} from "typeorm";

export class fulltext1590703119740 implements MigrationInterface {
    name = 'fulltext1590703119740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_2e008d2520e8798604e96e5c60` ON `compensation` (`description`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_214bf84bb5143b975a25e542b6` ON `contact_group` (`name`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_2429bbbfd3f51368aacc60bc5b` ON `contact` (`firstname`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_ed9931271d6dbff249440483ed` ON `contact` (`lastname`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_3c954ab52df6af830a87b06811` ON `contact` (`address`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_3e43db284e4d3f6c8bdd4672c8` ON `contact` (`postcode`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_1f07b9327c4e05c2f4b013bc29` ON `contact` (`city`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_0be9ddd6a2622bc2342221cea2` ON `contact` (`mail`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_30726b895c24d7a56ae11f0c56` ON `contact` (`mailSecond`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_bf6991a325cd96ab0bbbb0cabe` ON `contact` (`phoneFixed`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_8ac0fa0d5f90fc94945357d493` ON `contact` (`phoneFixedSecond`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_945af3231dac855316f9b07b73` ON `contact` (`phoneMobile`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_24e605891c5c4e294b0678c5de` ON `order` (`documentNr`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_389084ab606193c5c8247f6311` ON `order` (`title`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_3f892194f0cb2b824758499237` ON `order` (`deliveryAddress`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_d5e3bcc93b89836441df03728c` ON `billing_report` (`state`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_692ecac82a66153acc1dd3cbfd` ON `collection_point` (`name`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_d9785f13477a3904d35279ed59` ON `collection_point` (`address`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_30fd66a00be76236635c8751eb` ON `collection_point` (`postcode`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_7f5fab83b35cbe234a2faed20d` ON `collection_point` (`city`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_7a6bd8d32745e5670fd9215bdd` ON `contact_extension` (`iban`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_45617c15bc77e51e9ccffec403` ON `contact_extension` (`moreMails`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_f7bf6f5710ff21832738c56b05` ON `logoff` (`state`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_f7bf6f5710ff21832738c56b05` ON `logoff`");
        await queryRunner.query("DROP INDEX `IDX_45617c15bc77e51e9ccffec403` ON `contact_extension`");
        await queryRunner.query("DROP INDEX `IDX_7a6bd8d32745e5670fd9215bdd` ON `contact_extension`");
        await queryRunner.query("DROP INDEX `IDX_7f5fab83b35cbe234a2faed20d` ON `collection_point`");
        await queryRunner.query("DROP INDEX `IDX_30fd66a00be76236635c8751eb` ON `collection_point`");
        await queryRunner.query("DROP INDEX `IDX_d9785f13477a3904d35279ed59` ON `collection_point`");
        await queryRunner.query("DROP INDEX `IDX_692ecac82a66153acc1dd3cbfd` ON `collection_point`");
        await queryRunner.query("DROP INDEX `IDX_d5e3bcc93b89836441df03728c` ON `billing_report`");
        await queryRunner.query("DROP INDEX `IDX_3f892194f0cb2b824758499237` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_389084ab606193c5c8247f6311` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_24e605891c5c4e294b0678c5de` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_945af3231dac855316f9b07b73` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_8ac0fa0d5f90fc94945357d493` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_bf6991a325cd96ab0bbbb0cabe` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_30726b895c24d7a56ae11f0c56` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_0be9ddd6a2622bc2342221cea2` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_1f07b9327c4e05c2f4b013bc29` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_3e43db284e4d3f6c8bdd4672c8` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_3c954ab52df6af830a87b06811` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_ed9931271d6dbff249440483ed` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_2429bbbfd3f51368aacc60bc5b` ON `contact`");
        await queryRunner.query("DROP INDEX `IDX_214bf84bb5143b975a25e542b6` ON `contact_group`");
        await queryRunner.query("DROP INDEX `IDX_2e008d2520e8798604e96e5c60` ON `compensation`");
    }

}
