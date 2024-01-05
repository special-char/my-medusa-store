import React from "react";
import {
	Row,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	Table as TableType,
} from "@tanstack/react-table";
import { Table, Container, Heading } from "@medusajs/ui";
import { ProductReview } from "src/models/product-review";
import CustomTable from "../../../components/CustomTable";

const columnHelper = createColumnHelper<ProductReview>();
const column = columnHelper.accessor("customer.first_name", {});
const column1 = columnHelper.display({
	id: "actions",
	cell: (info) => {},
});
export type Column = typeof column & typeof column1;

interface Props {
	data: ProductReview[];
	PAGE_SIZE: number;
	columns: Column[];
	heading: string;
	table: TableType<ProductReview>;
}

const ReviewTable = ({ data, PAGE_SIZE, columns, heading, table }: Props) => {
	return (
		<Container className="overflow-hidden p-0">
			<div className="flex items-center justify-between px-8 pt-6 pb-4">
				<Heading>{heading}</Heading>
			</div>
			{/* <CustomTable
        PAGE_SIZE={PAGE_SIZE}
        data={data}
        table={table}
        columns={columns}
        heading={heading}
      /> */}
		</Container>
	);
};

export default ReviewTable;
