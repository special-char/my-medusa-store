"use client";
import { RouteConfig } from "@medusajs/admin";
import { useEffect, useState, useCallback } from "react";
import { Star } from "@medusajs/icons";
import {
  Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrrowRight } from "@medusajs/icons";
import { ProductReview } from "src/models/product-review";
import ReviewTable from "./components/review-table";

type Props = {};

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/reviews/${id}`,
      {
        method: "DELETE",
        headers: {},
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.log(error);
  }
}

const page = (props: Props) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const getAllProducts = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:9000/store/reviews`);
      const res = await response.json();
      return setReviews(res?.productReview);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getAllProducts();
    return () => {};
  }, []);

  const columnHelper = createColumnHelper<ProductReview>();

  const columns = [
    columnHelper.accessor("customer.first_name", {
      header: "Name",
      cell: (info) => (
        <a
          href={`/a/customers/${info.row.original.customer.id}`}
          className="text-blue-50 font-bold"
        >
          {info.row.original.customer.first_name}
          {info.row.original.customer.last_name}
        </a>
      ),
    }),
    columnHelper.accessor("id", {
      header: "Review Id",
      cell: (info) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("content", {
      header: "Description",
      cell: (info) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("rating", {
      header: "Rating",
      cell: (info) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => {
        return (
          <button
            className="bg-red-500 text-white p-2 rounded-lg"
            onClick={() => {
              handleDelete(info?.row?.original?.id);
            }}
          >
            Delete
          </button>
        );
      },
    }),
  ];
  const PAGE_SIZE = 10;
  const handleDelete = useCallback((id: string) => {
    deleteProduct(id);
    setReviews((prev) => prev.filter((x) => x.id !== id));
  }, []);
  const table = useReactTable<ProductReview>({
    data: reviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <ReviewTable
      PAGE_SIZE={PAGE_SIZE}
      data={reviews}
      columns={columns}
      table={table}
      heading={"Review List"}
    />
  );
};

export const config: RouteConfig = {
  link: {
    label: "Reviews",
    icon: Star,
  },
};

export default page;
