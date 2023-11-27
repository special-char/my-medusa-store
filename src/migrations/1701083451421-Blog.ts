import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm"

export class Blog1701083451421 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "blogs" (
              "id" character varying NOT NULL,
              "title" character varying NOT NULL,
              "content" character varying NOT NULL,
              "author_id" character varying NOT NULL,
              "category_id" character varying NOT NULL,
              "author_id" character varying NOT NULL,
              "deleted_at" TIMESTAMP WITH TIME ZONE,
              "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
          );`
          );
        
          await queryRunner.createPrimaryKey("blogs", ["id"]);

          await queryRunner.createForeignKey(
            "blogs",
            new TableForeignKey({
              columnNames: ["category_id"],
              referencedColumnNames: ["id"],
              referencedTableName: "product",
              onDelete: "CASCADE",
              onUpdate: "CASCADE",
            })
          );
      
          await queryRunner.createForeignKey(
            "blogs",
            new TableForeignKey({
              columnNames: ["customer_id"],
              referencedColumnNames: ["id"],
              referencedTableName: "customer",
              onDelete: "CASCADE",
              onUpdate: "CASCADE",
            })
          );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
