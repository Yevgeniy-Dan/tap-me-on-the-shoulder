import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Session } from "next-auth";

import { IGoogleApiTokenResponse } from "../interfaces/IGoogleApiTokenResponse.interface";

/**
 * Refreshes the Google access token by making a request to the server.
 * @returns A promise that resolves to the response from the token refresh request.
 */
const refreshToken = async () => {
  try {
    const response = await axios.get<IGoogleApiTokenResponse>(
      `/api/refresh-google-access-token`
    );

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to execute a query with Google authentication.
 * @param queryOptions Options for the query, such as queryKey, queryFn, etc.
 * @returns The result of the query execution.
 */
const useGoogleAuthedQuery = <T,>(queryOptions: any) => {
  const query = useQuery<T>({ ...queryOptions });
  // @ts-ignore
  if (query?.error?.response?.status === 401) {
    refreshToken()
      .then((response) => {
        localStorage.setItem("accessToken", response.data.access_token);
        query.refetch();
      })
      .catch((error) => {
        // query.error = {
        //   name: "",
        //   message: ""
        // }
      }); //TODO: return the error statement
  }

  return query;
};

export default useGoogleAuthedQuery;
