"use client"
import { RouteConfig } from "@medusajs/admin";
import { RocketLaunch } from "@medusajs/icons";
import React, { useState, useEffect } from 'react'
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyXzAxSEQ4QTFOMEZXNFlQMTJKUUJNNlIyR0pKIiwiZG9tYWluIjoiYWRtaW4iLCJpYXQiOjE3MDEwNjE0NTgsImV4cCI6MTcwMTE0Nzg1OH0.3vk_Nhe4UgPjno4sNkWFV0rlRff5S2m1MkhHEsbQZgY"
import { useAdminProducts } from "medusa-react"









const AnalyticsPage = () => {

  const [orders, setOrders] = useState();
  const dateNow = Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [month, setMonth] = useState(months.findIndex((x) => x == dateNow.split(" ")[1]) + 1);
  const [year, setYear] = useState(Number(dateNow.split(" ")[3]));

  console.log("monthh", month);
  console.log("orders ", orders);


  useEffect(() => {

    try {
      const getOrdres = async () => {
        // const url =`http://localhost:9000/admin/orders?created_at[gt]=${month}/01/${year}&created_at[lt]=${month}/31/${year}`;
        const url = `http://localhost:9000/admin/orders`;
        const orderRes = await fetch(url, {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
        }).then((res) => res.json()).then((responseJson) => {
          setOrders(responseJson);
          console.log("url ============================ , ", url);
        })

      }
      getOrdres();

    } catch (error) {
      console.log("error in analytics ", error);
    }

  }, [month, year])


  const monthlyChartData = new Array(31).fill(0);
  const currentYear = Number(dateNow.split(" ")[3]) ;
  const yearDecade = new Array(10).fill(0).map(( _ , index) => { return currentYear - index });
  const yearlyChartData = new Array(yearDecade.length).fill(0);
  

  if (!!orders) {

    const monthlyData = orders?.orders.filter((ele) => {
      const dayString = new Date(ele?.created_at);
      return dayString.getMonth() == month
    })


    console.log("month data ***************" , monthlyData);
    console.log("monthhhh" , dayString.getMonth( ));
    
    

    for (let index = 0; index < monthlyData.length; index++) {
      const element = monthlyData[index];
      // const day = Number(element?.created_at.split("T")[0].split("-")[2]) - 1;
      const dayString = new Date(element?.created_at);
      const day = dayString.getDate();

      const itemLength = element.items.length;
      // element.items.length
      // console.log("element date ==== ", element?.created_at);
      // console.log("day number ", day , typeof(day) );
      // console.log("item length ", itemLength);


      monthlyChartData[day] = monthlyChartData[day] + itemLength;


    }

    console.log("monthly chart data  ///////////////////////// ", monthlyChartData);


  }


  if (!!orders) {
    for (let index = 0; index < orders?.orders?.length; index++) {
      const element = orders?.orders[index];
      // const day = Number(element?.created_at.split("T")[0].split("-")[2]) - 1;
      const yearString = new Date(element?.created_at);
      const yr = yearString.getFullYear();

      const itemLength = element.items.length;
      // element.items.length
      // console.log("element date ==== ", element?.created_at);
      // console.log("day number ", day , typeof(day) );
      // console.log("item length ", itemLength);

      const i =  yearDecade.findIndex( (x) => x == yr ) ;
      yearlyChartData[i] = yearlyChartData[i] + itemLength;


    }
    console.log("yearly chart data /*/*/*/*/*/*/*/*/*/* " , yearlyChartData);

    
    
  }
  
  




  const options = {
    title: {
      text: "Sales in " + months[month - 1],
    },
    xAxis: {
      categories: new Array(31).fill().map((_, index) => index + 1),
    },
    yAxis: {
      title: {
        text: 'Item sold'
      }
    },
    series: [
      {
        name: months[month - 1],
        data: monthlyChartData,
      },

    ],
  };
  const options2 = {
    chart: {
      type: "pie",
    },
    title: {
      text: "Order Analytics",
    },
    xAxis: {
      categories: ["A", "B", "C", "D"],
    },
    yAxis: {
      title: {
        text: ["10", "20", "30", "40"],
      },
    },
    series: [
      {
        name: "Corn",
        data: [406292, 260000, 107000, 68300, 27500, 14500],
      },
      {
        name: "Wheat",
        data: [51086, 136000, 5500, 141000, 107180, 77000],
      },
    ],
  };
  const options3 = {
    chart: {
      type: "column",
    },
    title: {
      text: "Order Analytics",
    },
    xAxis: {
      categories: ["A", "B", "C", "D"],
    },
    yAxis: {
      title: {
        text: ["10", "20", "30", "40"],
      },
    },
    series: [
      {
        name: "Corn",
        data: [406292, 260000, 107000, 68300, 27500, 14500],
      },
      {
        name: "Wheat",
        data: [51086, 136000, 5500, 141000, 107180, 77000],
      },
    ],
  };


  return <div>



    This is my custom route


    charts
    <div className="flex gap-10">
      <div className="flex">
        select month <div><select id="month" value={month} onChange={(e) => { setMonth(e.target.value) }}>
          {
            months.map((item, index) => {
              return <option key={index} value={index + 1} > {item}</option>
            })
          }
        </select></div> </div>
      <div className="flex">Year<div><select id="year" value={year} onChange={(e) => { setYear(e.target.value) }}>
        {
          yearDecade.map((item, index) => {
            return <option key={index} value={item} > { item } </option>
          })
        } 
      </select></div> </div>
    </div>



    <div className="grid grid-cols-3 gap-6">
      <div className="shadow-xl bg-gray-200 border rounded-xl">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
      <div className="shadow-xl bg-gray-200 border rounded-xl">
        <HighchartsReact highcharts={Highcharts} options={options2} />
      </div>
      <div className="shadow-xl bg-gray-200 border rounded-xl">
        <HighchartsReact highcharts={Highcharts} options={options3} />
      </div>

    </div>
  </div>;
};

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: RocketLaunch,
  },
}


export default AnalyticsPage;

























