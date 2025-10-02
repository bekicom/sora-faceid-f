import { message } from "antd";
import { apiSlice } from "./api.service";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayment: builder.query({
      query: () => "/payment",
      providesTags: ['Payment'],

    }),
    getPaymentLog: builder.query({
      query: () => "/payment/get/log",
      providesTags: ['Payment'],

    }),
    getUncompletedPayment: builder.query({
      query: () => "/payment/get/debtor",
      providesTags: ['Payment'],
    }),
    getPaymentSummary: builder.query({
      query: () => "/payment/get/summary",
      providesTags: ['Payment'],
    }),
    getPaymentSummaryMonth: builder.query({
      query: ({ month }) => {
        if (!month) {
          throw new Error("Month parameter is required in MM-YYYY format"),
          message.error("Xato")
        }
        return `/payment/get/summary/month?month=${month}`;
      },
      providesTags: ['Payment'],
    }),
    // Get Payment by ID: GET - /payment/{id}
    getPaymentById: builder.query({
      query: (id) => `/payment/${id}`,
      providesTags: ['Payment'],
    }),
    // Create Payment: POST - /payment/create
    createPayment: builder.mutation({
      query: (body) => ({
        url: "/payment/create",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ['Payment', "School"],
    }),
    editPayment: builder.mutation({
      query: ({ body, id }) => ({
        url: `/payment/edit/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ['Payment', "School"],
    }),
    deletePayment: builder.mutation({
      query: ({ id, password }) => ({
        url: `/payment/delete/${id}`,
        method: "DELETE",
        body: { password },
      }),
      invalidatesTags: ['Payment', "School"],
    }),

    checkDebtStatus: builder.mutation({
      query: (body) => ({
        url: "/payment/check",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const { useGetPaymentQuery, useGetPaymentLogQuery, useGetUncompletedPaymentQuery, useGetPaymentSummaryQuery, useGetPaymentSummaryMonthQuery, useCreatePaymentMutation, useGetPaymentByIdQuery, useCheckDebtStatusMutation,
  useEditPaymentMutation, useDeletePaymentMutation } = paymentApi;
