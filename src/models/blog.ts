import { Image, SoftDeletableEntity } from "@medusajs/medusa";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from "typeorm";
import { User } from "@medusajs/medusa/dist/models/user";
import { generateEntityId } from "@medusajs/medusa/dist/utils";
import { BlogTag } from "./blog-tag";
import { BlogCategory } from "./blog-category";

export type ReviewStatus = "pending" | "approved" | "declined";

@Entity()
export class Blog extends SoftDeletableEntity {
  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Index()
  @Column({ nullable: true })
  author_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @ManyToMany(() => Image, { cascade: ["insert"] })
  @JoinTable({
    name: "blog_image",
    joinColumn: {
      name: "blog_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "image_id",
      referencedColumnName: "id",
    },
  })
  images: Image

  @ManyToMany(() => BlogTag)
  @JoinTable({
    name: "blog_tags",
    joinColumn: {
      name: "blog_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "blog_tag_id",
      referencedColumnName: "id",
    },
  })
  tags: BlogTag[]

  @Column({ type: "text", nullable: true })
  category_id: string | null

  @ManyToOne(() => BlogCategory)
  @JoinColumn({ name: "category_id" })
  type: BlogCategory

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "blog");
  }
}


