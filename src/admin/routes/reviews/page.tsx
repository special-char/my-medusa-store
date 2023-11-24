"use client";
import { RouteConfig } from "@medusajs/admin";
import { useEffect, useState, useCallback } from "react";
import { Star } from "@medusajs/icons";
import { Table } from "@medusajs/ui";
import { ProductReviewRepository } from "../../../repositories/product-review";
// import { ProductReviewRepository } from "src/repositories/product-review";

type Props = {};
export async function getAllProducts(set: (r: any) => void) {
  try {
    const response = await fetch(`http://localhost:9000/store/reviews`);
    const res = await response.json();
    set(res.productReview);
  } catch (error) {
    console.log({ error });
  }
}
export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`http://localhost:9000/store/reviews/${id}`, {
      method: "DELETE",
      headers: {},
    });
    const res = await response.json();
    alert("delete success");
    return res;
  } catch (error) {
    console.log({ error });
  }
}

const page = (props: Props) => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    getAllProducts(setReviews);

    return () => {};
  }, []);

  // const reviews = await getAllProducts()
  const handleDelete = useCallback((id: string) => {
    deleteProduct(id);
    setReviews((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            {/* {columns.map(col =><Table.HeaderCell>{col}</Table.HeaderCell> )} */}
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Review Id</Table.HeaderCell>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Rating</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {reviews?.map((review) => {
            return (
              <Table.Row
                key={review?.id}
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell>
                  {review?.customer?.first_name} {review?.customer?.last_name}
                </Table.Cell>
                <Table.Cell>{review?.id}</Table.Cell>
                <Table.Cell>{review?.title}</Table.Cell>
                <Table.Cell>{review?.content}</Table.Cell>
                <Table.Cell>{review?.rating}</Table.Cell>
                <Table.Cell>
                  <button
                    className="bg-red-500 text-white p-2 rounded-lg"
                    onClick={() => {
                      handleDelete(review?.id);
                    }}
                  >
                    Delete
                  </button>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {/* <DiscountTable /> */}
    </>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Reviews",
    icon: Star,
  },
};

export default page;
