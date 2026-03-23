import { useAtom } from "jotai";
import { authAtom } from "./Atoms";
import { useNavigation } from "@react-navigation/native";
import { createOfflineError } from "./connectivity";

export { useFetch };

function useFetch() {
  const [user, setUser] = useAtom(authAtom);
  const navigation = useNavigation();

  return {
    get: request("GET"),
    post: request("POST"),
    put: request("PUT"),
    delete: request("DELETE"),
    patch: request("PATCH"),
  };

  function request(method) {
    return (url, body, headers = {}, forceDynamic = false) => {
      const requestOptions = {
        method,
        headers,
      };

      if (user?.token) {
        requestOptions.headers["Authorization"] = user.token;
      }

      if (forceDynamic) 
        requestOptions["cache"] = "no-store";

      if (body) {
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
      }

      return fetch(url, requestOptions)
        .catch(() => Promise.reject(createOfflineError()))
        .then(handleResponse);
    };
  }

  // helper functions

  async function handleResponse(response) {
    try {
      const isJson = response.headers
        ?.get("content-type")
        ?.includes("application/json");
      const data = isJson ? await response.json() : null;

      // check for error response
      if (!response.ok) {
        if (response.status === 401) {
          // api auto logs out on 401 Unauthorized, so redirect to login page
          //router.push("/account/login");
          logOut();
        }

        // get error message from body or default to response status
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }

      return data;
    } catch (err) {
      console.log("Error while handling response: ", err);
      return Promise.reject(err);
    }
  }

  function logOut() {
    // remove user from local storage to log user out
    console.log("logging out");
    setUser({});
    navigation.navigate("Home");
  }
}
