"use client";
import { RouteConfig } from "@medusajs/admin";
import { useEffect, useState, useCallback } from "react";
import { Star, XMark } from "@medusajs/icons";
import {
	createColumnHelper,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { ProductReview } from "src/models/product-review";
import ReviewTable from "./components/review-table";

// type ReviewStatuss = ReviewStatus;
type ReviewStatus = "pending" | "approved" | "declined";
type Props = {};

export async function deleteProduct(id: string, callback: () => void) {
	try {
		const value = confirm(
			"Review will be deleted, Are you sure you want to delete"
		);

		if (value) {
			const response = await fetch(
				`${process.env.MEDUSA_BACKEND_URL}/store/reviews/${id}`,
				{
					method: "DELETE",
					headers: {},
				}
			);
			const res = await response.json();
			if (callback) callback();
			return res;
		}
	} catch (error) {
		console.log(error);
	}
}

export async function updateProductReview(
	id: string,
	status: ReviewStatus,
	callback?: () => void
) {
	try {
		const response = await fetch(
			`${process.env.MEDUSA_BACKEND_URL}/store/reviews/${id}`,
			{
				method: "PUT",
				body: JSON.stringify({ status }),
				headers: {},
			}
		);
		const res = await response.json();
		if (callback) callback();
		return res;
	} catch (error) {
		console.log(error);
	}
}

const page = (props: Props) => {
	const [reviews, setReviews] = useState<ProductReview[]>([]);

	const getAllProducts = useCallback(async () => {
		try {
			const response = await fetch(
				`${process.env.MEDUSA_BACKEND_URL}/store/reviews`
			);
			const res = await response.json();
			return setReviews(res?.productReview);
		} catch (error) {
			console.log(error);
		}
	}, []);

	const successCallback = (status: ReviewStatus, id: string) => {
		const affectedReviewIndex = reviews.findIndex((item) => item.id === id);
		const affectedReview = reviews.find((item) => item.id === id);
		setReviews((prev) => {
			return [
				...prev.slice(0, affectedReviewIndex),
				{ ...affectedReview, status },
				...prev.slice(affectedReviewIndex + 1),
			];
		});
	};
	const [modalOpen, setModalOpen] = useState({ open: false, params: {} });
	const handleStatus = async (id: string, status: ReviewStatus) => {
		try {
			const response = await updateProductReview(id, status, () =>
				successCallback(status, id)
			);
		} catch (error) {
			throw new Error(error);
		}
	};

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
			header: "Status",
			id: "status",
			cell: (info) => {
				const reviewId = info.row.original.id;
				const status = info.row.original.status;
				return (
					<div className="flex w-[200px] gap-5">
						{status === "pending" ? (
							<>
								<button
									className="bg-green-500 text-white p-2 rounded-lg"
									onClick={() => {
										handleStatus(reviewId, "approved");
									}}
								>
									Approve
								</button>
								<button
									className="bg-orange-500 text-white p-2 rounded-lg"
									onClick={() => {
										handleStatus(reviewId, "declined");
									}}
								>
									Decline
								</button>
							</>
						) : (
							status.toUpperCase()
						)}
					</div>
				);
			},
		}),
		columnHelper.display({
			id: "actions",
			cell: (info) => {
				return (
					<div className="flex gap-4 flex-row">
						<button
							className="bg-blue-500 text-white p-2 rounded-lg"
							onClick={() => {
								setModalOpen({ open: true, params: info.row.original });
							}}
						>
							View
						</button>
						<button
							className="bg-red-500 text-white p-2 rounded-lg"
							onClick={() => {
								handleDelete(info?.row?.original?.id);
							}}
						>
							Delete
						</button>
					</div>
				);
			},
		}),
	];
	const PAGE_SIZE = 10;
	const handleDelete = useCallback((id: string) => {
		deleteProduct(id, () => {
			setReviews((prev) => prev.filter((x) => x.id !== id));
		});
	}, []);
	const sortReview = reviews?.sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);
	const table = useReactTable<ProductReview>({
		data: sortReview,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});
	const { open, params } = modalOpen;

	return (
		<div className="relative">
			<ReviewTable
				PAGE_SIZE={PAGE_SIZE}
				data={sortReview}
				columns={columns}
				table={table}
				heading={"Review List"}
			/>
			<dialog
				open={open}
				className="absolute top-[40%] h-[40%] w-[40%] shadow-2xl rounded-lg bg-white"
			>
				<div>
					<div className="top justify-between flex flex-1">
						<p>Review details</p>
						<button
							className="bg-white shadow-sm p-2 rounded-lg"
							onClick={() => {
								setModalOpen({ open: false, params: {} });
							}}
						>
							<XMark color="red" />
						</button>
					</div>
					<p>Title:- {params?.title}</p>
					<p>Description:- {params?.content}</p>
					<p>Rating:- {params?.rating}</p>
					<p>Status:- {params?.status?.toUpperCase()}</p>
					<p>
						User:-{" "}
						<a
							href={`/a/customers/${params?.customer?.id}`}
							className="text-blue-50 font-bold"
						>
							{params?.customer?.first_name}
							{params?.customer?.last_name}
						</a>
					</p>
					{/* <p>User:- {params.customer.first_name}</p> */}
				</div>
			</dialog>
		</div>
	);
};

export const config: RouteConfig = {
	link: {
		label: "Reviews",
		icon: Star,
	},
};

export default page;
