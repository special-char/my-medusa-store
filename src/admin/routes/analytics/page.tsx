"use client"
import { RouteConfig } from "@medusajs/admin";
import { RocketLaunch } from "@medusajs/icons";
import React, { useState, useEffect } from 'react'

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyXzAxSEQ4QTFOMEZXNFlQMTJKUUJNNlIyR0pKIiwiZG9tYWluIjoiYWRtaW4iLCJpYXQiOjE3MDA3OTkxODQsImV4cCI6MTcwMDg4NTU4NH0.xo3N3F2cwxMezRsz1TD23b4vAiicFmubtLMFFGfL140"

// const getOrders = async () => {




// }




const AnalyticsPage = () => {

  const [orders, setOrders] = useState();
  useEffect(() => {

    const getOrdres = async () => {
      try {

        const orderRes = await fetch("http://localhost:9000/admin/orders", {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
        }
        ).then((response) => response.json())
          .then((responseJson) => {
            // console.log(responseJson);
            setOrders(responseJson);
          });

      } catch (error) {
        console.log("error in analytics ", error);

      }
    }
    getOrdres();
  }, [])

  console.log(" orders state ", orders);

  return <div>



    This is my custom route


    charts</div>;
};

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: RocketLaunch,
  },
}


export default AnalyticsPage;
