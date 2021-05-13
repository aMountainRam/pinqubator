import axios from "axios";
const URL = `https://${process.env.REACT_APP_APIHOST}:${process.env.REACT_APP_APIPORT}/${process.env.REACT_APP_APIBASE}`;

export function getInstants(username) {
    console.log(URL);
    return axios.get(`${URL}/instants/${username}`,{
        headers: {
            "Content-Type": "application/json",
        }
    });
}

export function uploadInstant(form) {
    return axios.post(`${URL}/instants`, form, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}
