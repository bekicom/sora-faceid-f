import { apiSlice } from "./api.service";

export const coinApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoin: builder.query({
      query: () => "/students",
      providesTags: ["Students"],
    }),

    addStudent: builder.mutation({
      query: (body) => ({
        url: "/students",
        method: "POST",
        body, // ❌ JSON.stringify emas
      }),
      invalidatesTags: ["Students", "Classes"],
    }),

    updateStudent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/${id}`,
        method: "PUT",
        body, // ❌ JSON.stringify emas
      }),
      invalidatesTags: ["Students", "Classes"],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students", "Classes"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoinQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = coinApi;
