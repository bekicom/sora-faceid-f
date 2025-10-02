import { apiSlice } from "./api.service";

export const harajatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHarajat: builder.query({
      query: () => "/harajat",
      providesTags: ['Harajat'],
    }),
    getHarajatSummary: builder.query({
      query: () => "/harajat/get/summary",
      providesTags: ['Harajat'],
    }),
    addHarajat: builder.mutation({
      query: (body) => ({
        url: "/harajat",
        method: "POST",
        body: JSON.stringify(body),
      }),
      invalidatesTags: ['Harajat', "School"],
    })
  }),
  overrideExisting: false,
});

export const { useGetHarajatQuery, useGetHarajatSummaryQuery, useAddHarajatMutation } = harajatApi;
